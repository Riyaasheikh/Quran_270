<?php

declare(strict_types=1);

namespace App\Services\QuranLinker;

/**
 * Framework-free: takes plain rows (arrays or stdClass) and returns plain arrays,
 * so it can be cached and unit-tested without a database.
 *
 * Sources:
 *   prophets_inventory        -> prophets whose anchors contain the verse
 *   other_figures_and_groups  -> figures/groups whose anchors contain the verse
 *   quran_story_segments      -> Musa story segment the verse belongs to (+ parallel tellings)
 *   quran_cross_references    -> each row is a verse/passage elsewhere that is linked to
 *                                Musa-story anchor passages. Matched in BOTH directions.
 */
final class QuranLinkerService
{
    /** Segments that are loose mentions, so "same segment" is not a meaningful parallel. */
    private const NON_PARALLEL_SEGMENT = '/brief mentions|other events/i';

    /** Anchors spanning more verses than this are flagged "broad". */
    private const BROAD_ANCHOR_SPAN = 30;

    private const MAX_PARALLELS = 8;

    // ---------------------------------------------------------------- index

    public function buildIndex(
        iterable $prophets,
        iterable $figures,
        iterable $crossReferences,
        iterable $storyRows
    ): array {
        $index = ['prophets' => [], 'figures' => [], 'cross' => [], 'story' => []];

        foreach ($prophets as $row) {
            $row = (array) $row;
            $ranges = AnchorParser::parse($row['principal_passage_anchors'] ?? null);

            if ($ranges === []) {
                continue; // e.g. Musa: "See musa_story_candidates.csv" (covered by the story index)
            }

            $index['prophets'][] = [
                'id' => $row['id'] ?? null,
                'order' => (int) ($row['prophet_no'] ?? 0),
                'name' => $row['prophet_name'] ?? '',
                'name_ar' => $row['name_ar'] ?? '',
                'status' => $row['status'] ?? null,
                'note' => $row['quranic_status_note'] ?? null,
                'flags' => $row['flags_and_do_not_assume'] ?? null,
                'unverified' => self::isUnverified($row),
                'ranges' => $ranges,
            ];
        }

        foreach ($figures as $row) {
            $row = (array) $row;
            $ranges = AnchorParser::parse($row['principal_anchors'] ?? null);

            if ($ranges === []) {
                continue; // e.g. Pharaoh: "See Musa dataset"
            }

            $index['figures'][] = [
                'id' => $row['id'] ?? null,
                'name' => $row['figure_or_group'] ?? '',
                'type' => $row['figure_type'] ?? null,
                'identity_status' => $row['identity_status'] ?? null,
                'linked_prophets' => $row['linked_prophets'] ?? null,
                'flags' => $row['do_not_assume_or_flags'] ?? null,
                'unverified' => self::isUnverified($row),
                'ranges' => $ranges,
            ];
        }

        foreach ($storyRows as $row) {
            $row = (array) $row;
            $surah = (int) $row['surah_number'];

            [$segmentCode, $segmentTitle] = self::splitSegment((string) ($row['story_segment'] ?? ''));
            [$tafsir, $flag] = self::splitFlag((string) ($row['tafsir_reference'] ?? ''));

            $index['story'][] = [
                'story_id' => $row['story_id'] ?? '',
                'story_title' => $row['story_title'] ?? '',
                'segment_code' => $segmentCode,
                'segment_title' => $segmentTitle,
                'surah_number' => $surah,
                'surah_name' => $row['surah_name'] ?? '',
                'ayah_start' => (int) $row['ayah_start'],
                'ayah_end' => (int) $row['ayah_end'],
                'start' => AnchorParser::key($surah, (int) $row['ayah_start']),
                'end' => AnchorParser::key($surah, (int) $row['ayah_end']),
                'relationship_type' => $row['relationship_type'] ?? null,
                'summary' => $row['narrative_summary'] ?? null,
                'connection' => $row['connection_explanation'] ?? null,
                'tafsir_reference' => $tafsir,
                'flag' => $flag,
                'source_status' => $row['source_status'] ?? null,
                'review_status' => $row['review_status'] ?? null,
                'unverified' => self::isUnverified($row),
            ];
        }

        foreach ($crossReferences as $row) {
            $row = (array) $row;
            $surah = (int) $row['surah_number'];
            $anchorRaw = (string) ($row['anchor_story_passages'] ?? '');

            $index['cross'][] = [
                'theme' => $row['theme'] ?? '',
                'classification' => $row['classification'] ?? null,
                'note' => $row['connection_explanation'] ?? null,
                'tafsir_reference' => $row['tafsir_reference'] ?? null,
                'source_status' => $row['source_status'] ?? null,
                'review_status' => $row['review_status'] ?? null,
                'unverified' => self::isUnverified($row),
                'surah_number' => $surah,
                'surah_name' => $row['surah_name'] ?? '',
                'ayah_start' => (int) $row['ayah_start'],
                'ayah_end' => (int) $row['ayah_end'],
                'start' => AnchorParser::key($surah, (int) $row['ayah_start']),
                'end' => AnchorParser::key($surah, (int) $row['ayah_end']),
                'anchors' => AnchorParser::parse($anchorRaw),
                'story_wide' => (bool) preg_match('/all\s+story\s+rows/i', $anchorRaw),
            ];
        }

        return $index;
    }

    // --------------------------------------------------------------- lookup

    public function linksFor(array $index, int $surah, int $ayah): array
    {
        $k = AnchorParser::key($surah, $ayah);

        $prophets = $this->matchRegistry($index['prophets'], $k, 'prophet');
        $figures = $this->matchRegistry($index['figures'], $k, 'figure');
        $story = $this->matchStory($index['story'], $k, $surah);
        $cross = $this->matchCrossReferences($index['cross'], $k);

        $all = array_merge($prophets, $figures, $story, $cross);

        return [
            'verse_key' => "{$surah}:{$ayah}",
            'total' => count($all),
            'has_unverified' => (bool) array_filter($all, fn ($i) => !empty($i['unverified'])),
            'prophets' => $prophets,
            'figures' => $figures,
            'story' => $story,
            'cross_references' => $cross,
        ];
    }

    // ------------------------------------------------------------- matchers

    private function matchRegistry(array $items, int $k, string $kind): array
    {
        $hits = [];

        foreach ($items as $item) {
            $match = null;

            foreach ($item['ranges'] as $range) {
                if ($k < $range['start'] || $k > $range['end']) {
                    continue;
                }
                // Prefer a direct anchor over a "thematic" one
                if ($match === null || ($match['thematic'] && !$range['thematic'])) {
                    $match = $range;
                }
            }

            if ($match === null) {
                continue;
            }

            $common = [
                'id' => $item['id'],
                'passage' => $match['label'],
                'jump' => $match['jump'],
                'match_note' => $match['note'],
                'group' => $match['group'],
                'thematic' => $match['thematic'],
                'flags' => $item['flags'],
                'unverified' => $item['unverified'],
            ];

            $hits[] = $kind === 'prophet'
                ? $common + [
                    'name' => $item['name'],
                    'name_ar' => $item['name_ar'],
                    'status' => $item['status'],
                    'note' => $item['note'],
                    'order' => $item['order'],
                ]
                : $common + [
                    'name' => $item['name'],
                    'type' => $item['type'],
                    'identity_status' => $item['identity_status'],
                    'linked_prophets' => $item['linked_prophets'],
                    'order' => 0,
                ];
        }

        usort($hits, fn ($a, $b) => [$a['thematic'], $a['order'], $a['name']] <=> [$b['thematic'], $b['order'], $b['name']]);

        return $hits;
    }

    private function matchStory(array $rows, int $k, int $surah): array
    {
        $hits = [];

        foreach ($rows as $row) {
            if ($k < $row['start'] || $k > $row['end']) {
                continue;
            }

            $hits[] = [
                'story_id' => $row['story_id'],
                'story_title' => $row['story_title'],
                'segment_code' => $row['segment_code'],
                'segment_title' => $row['segment_title'],
                'relationship_type' => $row['relationship_type'],
                'summary' => $row['summary'],
                'connection' => $row['connection'],
                'tafsir_reference' => $row['tafsir_reference'],
                'flag' => $row['flag'],
                'passage' => self::passage($row['surah_number'], $row['ayah_start'], $row['ayah_end']),
                'surah_name' => $row['surah_name'],
                'source_status' => $row['source_status'],
                'review_status' => $row['review_status'],
                'unverified' => $row['unverified'],
                'parallels' => $this->parallels($rows, $row, $surah),
            ];
        }

        return $hits;
    }

    /** Other tellings of the same segment in OTHER surahs, with adjacent rows merged. */
    private function parallels(array $rows, array $current, int $surah): array
    {
        if (
            $current['segment_code'] === null
            || preg_match(self::NON_PARALLEL_SEGMENT, (string) $current['segment_title'])
        ) {
            return [];
        }

        $bySurah = [];

        foreach ($rows as $row) {
            if (
                $row['story_id'] === $current['story_id']
                && $row['segment_code'] === $current['segment_code']
                && $row['surah_number'] !== $surah
            ) {
                $bySurah[$row['surah_number']][] = $row;
            }
        }

        ksort($bySurah);
        $out = [];

        foreach ($bySurah as $surahNumber => $group) {
            usort($group, fn ($a, $b) => $a['ayah_start'] <=> $b['ayah_start']);

            $merged = [];
            foreach ($group as $row) {
                $last = count($merged) - 1;

                if ($last >= 0 && $row['ayah_start'] <= $merged[$last]['ayah_end'] + 1) {
                    $merged[$last]['ayah_end'] = max($merged[$last]['ayah_end'], $row['ayah_end']);
                } else {
                    $merged[] = $row;
                }
            }

            foreach ($merged as $row) {
                $out[] = [
                    'surah_number' => $surahNumber,
                    'surah_name' => $row['surah_name'],
                    'passage' => self::passage($surahNumber, $row['ayah_start'], $row['ayah_end']),
                    'jump' => "{$surahNumber}:{$row['ayah_start']}",
                    'relationship_type' => $row['relationship_type'],
                ];
            }
        }

        return array_slice($out, 0, self::MAX_PARALLELS);
    }

    private function matchCrossReferences(array $rows, int $k): array
    {
        $hits = [];

        foreach ($rows as $row) {
            $own = self::passage($row['surah_number'], $row['ayah_start'], $row['ayah_end']);

            $base = [
                'theme' => $row['theme'],
                'classification' => $row['classification'],
                'note' => $row['note'],
                'tafsir_reference' => $row['tafsir_reference'],
                'source_status' => $row['source_status'],
                'review_status' => $row['review_status'],
                'unverified' => $row['unverified'],
            ];

            // A) The verse being read IS the linked passage -> point to the Musa story anchors.
            if ($k >= $row['start'] && $k <= $row['end']) {
                $targets = $row['story_wide']
                    ? [['label' => "Throughout Musa's story", 'jump' => null]]
                    : array_map(fn ($a) => ['label' => $a['label'], 'jump' => $a['jump']], $row['anchors']);

                $hits[] = $base + [
                    'direction' => 'to_story',
                    'passage' => $own,
                    'targets' => $targets,
                    'span' => 0,
                    'broad' => false,
                ];
            }

            // B) The verse being read sits inside a Musa-story anchor -> point to the linked passage.
            $matched = null;
            foreach ($row['anchors'] as $anchor) {
                if ($k >= $anchor['start'] && $k <= $anchor['end']) {
                    $span = ($anchor['end'] - $anchor['start']) + 1;
                    if ($matched === null || $span < $matched['span']) {
                        $matched = ['anchor' => $anchor, 'span' => $span];
                    }
                }
            }

            if ($matched !== null) {
                $hits[] = $base + [
                    'direction' => 'from_story',
                    'passage' => $own,
                    'matched_anchor' => $matched['anchor']['label'],
                    'targets' => [[
                        'label' => "{$own} · {$row['surah_name']}",
                        'jump' => "{$row['surah_number']}:{$row['ayah_start']}",
                    ]],
                    'span' => $matched['span'],
                    'broad' => $matched['span'] > self::BROAD_ANCHOR_SPAN,
                ];
            }
        }

        // Direct links first, then most specific anchors, then by theme
        usort($hits, fn ($a, $b) => [$a['direction'] === 'to_story' ? 0 : 1, $a['span'], $a['theme']]
            <=> [$b['direction'] === 'to_story' ? 0 : 1, $b['span'], $b['theme']]);

        return $hits;
    }

    // -------------------------------------------------------------- helpers

    private static function passage(int $surah, int $start, int $end): string
    {
        return $end > $start ? "{$surah}:{$start}-{$end}" : "{$surah}:{$start}";
    }

    /** "S08 Mission and dialogue with Pharaoh" -> ["S08", "Mission and dialogue with Pharaoh"] */
    private static function splitSegment(string $segment): array
    {
        if (preg_match('/^(S\d+)\s+(.*)$/u', trim($segment), $m)) {
            return [$m[1], trim($m[2])];
        }

        return [null, trim($segment)];
    }

    /** Separates the "FLAG: ..." caution that the CSV appends to tafsir_reference. */
    private static function splitFlag(string $tafsir): array
    {
        $parts = preg_split('/\s*;?\s*FLAG:\s*/', $tafsir, 2) ?: [$tafsir];

        $reference = rtrim(trim($parts[0]), ';');
        $flag = isset($parts[1]) ? trim($parts[1]) : null;

        return [$reference === '' ? null : $reference, $flag === '' ? null : $flag];
    }

    private static function isUnverified(array $row): bool
    {
        foreach (['status', 'review_status', 'source_status'] as $field) {
            if (isset($row[$field]) && preg_match('/UNVERIFIED|PENDING|CANDIDATE/i', (string) $row[$field])) {
                return true;
            }
        }

        return false;
    }
}