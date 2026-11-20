<?php

namespace App\Services\GuideAgent;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class GuideContextBuilder
{
    /**
     * Common transliteration aliases so searches match regardless of spelling.
     */
    protected array $aliases = [
        'yousaf'   => ['yusuf', 'joseph', '12'],
        'yusuf'    => ['yousaf', 'joseph', '12'],
        'musa'     => ['moses', '28', '20', '7'],
        'moses'    => ['musa', '28', '20'],
        'ibrahim'  => ['abraham', '14', '2'],
        'isa'      => ['jesus', '19', '3'],
        'nuh'      => ['noah', '71', '11'],
        'yunus'    => ['jonah', '10', '37'],
        'sulaiman' => ['solomon', '27'],
        'dawud'    => ['david', '38'],
        'patience' => ['sabr', 'steadfast', 'perseverance'],
        'sabr'     => ['patience', 'steadfast'],
        'masjid'   => ['mosque', 'prayer'],
        'mosque'   => ['masjid', 'facility'],
    ];

    public function build(string $message): string
    {
        $terms    = $this->extractSearchTerms($message);
        $sections = [];

        if (empty($terms)) {
            return 'No specific database records matched.';
        }

        // 1. Search Prophets & Quranic Figures table(s)
        $prophetMatches = $this->searchFlexibleTable(
            ['prophets_and_figures', 'prophets', 'quran_figures'],
            $terms,
            4
        );
        if (!empty($prophetMatches)) {
            $sections[] = "MATCHING PROPHETS / FIGURES IN DATABASE:\n" . $prophetMatches;
        }

        // 2. Search Quran Stories table (if present)
        $storyMatches = $this->searchFlexibleTable(
            ['quran_stories', 'stories'],
            $terms,
            3
        );
        if (!empty($storyMatches)) {
            $sections[] = "MATCHING QURAN STORIES IN DATABASE:\n" . $storyMatches;
        }

        // 3. Search Quran Cross-References table
        $crossRefMatches = $this->searchFlexibleTable(
            ['quran_cross_references', 'quran_linker_entries'],
            $terms,
            4
        );
        if (!empty($crossRefMatches)) {
            $sections[] = "MATCHING QURAN CROSS-REFERENCES IN DATABASE:\n" . $crossRefMatches;
        }

        // 4. Search Mosque Facilities if user asks about mosques/facilities
        if (Str::contains(Str::lower($message), ['mosque', 'masjid', 'wudu', 'parking', 'women', 'jummah'])) {
            $mosqueMatches = $this->searchFlexibleTable(
                ['mosque_facilities'],
                $terms,
                3
            );
            if (!empty($mosqueMatches)) {
                $sections[] = "MATCHING MOSQUE FACILITIES IN DATABASE:\n" . $mosqueMatches;
            }
        }

        return empty($sections)
            ? 'No specific database records matched.'
            : implode("\n\n", $sections);
    }

    protected function extractSearchTerms(string $message): array
    {
        $stopWords = [
            'where', 'what', 'when', 'which', 'about', 'story', 'prophet',
            'tell', 'show', 'find', 'open', 'page', 'site', 'your', 'with',
            'from', 'that', 'this', 'have', 'for', 'the', 'and', 'can', 'you',
        ];

        $words = preg_split('/[^a-z0-9]+/i', Str::lower($message), -1, PREG_SPLIT_NO_EMPTY);
        $terms = [];

        foreach ($words as $word) {
            if (strlen($word) < 3 || in_array($word, $stopWords, true)) {
                continue;
            }
            $terms[] = $word;
            if (isset($this->aliases[$word])) {
                $terms = array_merge($terms, $this->aliases[$word]);
            }
        }

        return array_values(array_unique(array_slice($terms, 0, 8)));
    }

    protected function searchFlexibleTable(array $candidateTables, array $terms, int $limit): string
    {
        foreach ($candidateTables as $table) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            $columns = Schema::getColumnListing($table);
            $searchableCols = array_values(array_diff($columns, [
                'id', 'created_at', 'updated_at', 'deleted_at', 'password', 'remember_token',
            ]));

            if (empty($searchableCols)) {
                continue;
            }

            $rows = DB::table($table)
                ->where(function ($query) use ($searchableCols, $terms) {
                    foreach ($terms as $term) {
                        foreach ($searchableCols as $col) {
                            $query->orWhere($col, 'LIKE', '%' . $term . '%');
                        }
                    }
                })
                ->limit($limit)
                ->get();

            if ($rows->isNotEmpty()) {
                return $rows->map(function ($row) {
                    $arr = array_filter((array) $row, fn ($v, $k) => !in_array($k, ['id', 'created_at', 'updated_at'], true) && $v !== null && $v !== '', ARRAY_FILTER_USE_BOTH);
                    return '- ' . Str::limit(json_encode($arr, JSON_UNESCAPED_UNICODE), 450);
                })->implode("\n");
            }
        }

        return '';
    }
}