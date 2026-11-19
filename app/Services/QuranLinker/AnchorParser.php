<?php

declare(strict_types=1);

namespace App\Services\QuranLinker;

/**
 * Turns the free-text anchor columns in the CSVs into structured verse ranges.
 *
 * Handles the shapes that actually occur in the data:
 *   "2:30-39; 7:11-25"                         ranges separated by ';'
 *   "11:70, 11:74-83"                          several refs in one segment
 *   "66:10 (wife, unnamed)"                    trailing note
 *   "89:6-8 (Ad; Hud not named)"               note containing a ';'
 *   "7:26-27, 7:31 (… 'children of Adam', thematic)"
 *   "Named: 3:144; 33:40. Event anchors (asbab-dependent): 96:1-5; 74:1-7"
 *                                              group labels
 *   "See Musa dataset"                         no verse refs -> returns []
 */
final class AnchorParser
{
    private const REF = '/(\d{1,3}):(\d{1,3})(?:\s*[-–—]\s*(?:(\d{1,3}):)?(\d{1,3}))?/u';

    /** surah * 1000 + ayah: sortable, and safe because no surah has 1000+ ayahs. */
    public static function key(int $surah, int $ayah): int
    {
        return $surah * 1000 + $ayah;
    }

    /**
     * @return list<array{label:string,start:int,end:int,jump:string,note:?string,group:?string,thematic:bool}>
     */
    public static function parse(?string $raw): array
    {
        $raw = trim((string) $raw);

        if ($raw === '' || $raw === '-') {
            return [];
        }

        $entries = [];
        $group = null;

        // "61:6. Event anchors (...)": a '.' followed by a capital starts a new labelled block.
        foreach (preg_split('/\.\s+(?=[A-Z])/', $raw) ?: [] as $block) {
            foreach (self::splitTopLevel($block, ';') as $segment) {
                $segment = trim($segment);

                if ($segment === '') {
                    continue;
                }

                // Leading group label, e.g. "Named: 3:144"
                if (preg_match('/^([A-Za-z][^:\d]*?):\s*(?=\d)/u', $segment, $label)) {
                    $group = trim($label[1]);
                    $segment = trim(substr($segment, strlen($label[0])));
                }

                // Trailing "(note)" applies to every ref in this segment
                $note = null;
                if (preg_match('/\(([^()]*)\)[\s.]*$/u', $segment, $paren, PREG_OFFSET_CAPTURE)) {
                    $note = trim($paren[1][0]) ?: null;
                    $segment = trim(substr($segment, 0, $paren[0][1]));
                }

                if (!preg_match_all(self::REF, $segment, $matches, PREG_SET_ORDER)) {
                    continue;
                }

                foreach ($matches as $match) {
                    $entry = self::buildEntry($match, $note, $group);

                    if ($entry !== null) {
                        $entries[] = $entry;
                    }
                }
            }
        }

        return $entries;
    }

    /** @param array<int,string> $m */
    private static function buildEntry(array $m, ?string $note, ?string $group): ?array
    {
        $s1 = (int) $m[1];
        $a1 = (int) $m[2];
        $hasEnd = isset($m[4]) && $m[4] !== '';
        $s2 = (isset($m[3]) && $m[3] !== '') ? (int) $m[3] : $s1;
        $a2 = $hasEnd ? (int) $m[4] : $a1;

        $valid = $s1 >= 1 && $s1 <= 114 && $s2 >= 1 && $s2 <= 114
            && $a1 >= 1 && $a1 <= 286 && $a2 >= 1 && $a2 <= 286;

        if (!$valid) {
            return null;
        }

        $start = self::key($s1, $a1);
        $end = self::key($s2, $a2);

        if ($end < $start) {
            return null; // malformed range: skip rather than guess
        }

        $label = "{$s1}:{$a1}";
        if ($hasEnd) {
            $label .= $s2 === $s1 ? "-{$a2}" : "-{$s2}:{$a2}";
        }

        return [
            'label' => $label,
            'start' => $start,
            'end' => $end,
            'jump' => "{$s1}:{$a1}",
            'note' => $note,
            'group' => $group,
            'thematic' => $note !== null && stripos($note, 'thematic') !== false,
        ];
    }

    /** Split on a delimiter that is not inside parentheses. */
    private static function splitTopLevel(string $text, string $delimiter): array
    {
        $parts = [];
        $buffer = '';
        $depth = 0;

        // Byte loop is UTF-8 safe here: ASCII bytes never occur inside multibyte sequences.
        for ($i = 0, $n = strlen($text); $i < $n; $i++) {
            $char = $text[$i];

            if ($char === '(') {
                $depth++;
            } elseif ($char === ')') {
                $depth = max(0, $depth - 1);
            }

            if ($char === $delimiter && $depth === 0) {
                $parts[] = $buffer;
                $buffer = '';
                continue;
            }

            $buffer .= $char;
        }

        $parts[] = $buffer;

        return $parts;
    }
}