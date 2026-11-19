<?php

namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use App\Services\QuranLinker\QuranLinkerService;

class QuranLinkerController extends Controller
{
    private const LINKER_INDEX_CACHE_KEY = 'quran_linker:index:v1';
    private const LINKER_INDEX_CACHE_TTL = 3600; // seconds; run `php artisan cache:clear` after reseeding

    /**
     * Split a semicolon-separated verse_keys value into individual keys.
     *
     * Example: "2:155;2:156;2:157"
     * Returns: ["2:155", "2:156", "2:157"]
     */
    private function parseVerseKeys(?string $verseKeys): array
    {
        if (!$verseKeys) {
            return [];
        }

        return collect(explode(';', $verseKeys))
            ->map(fn ($key) => trim($key))
            ->filter(fn ($key) => preg_match('/^\d{1,3}:\d{1,3}$/', $key))
            ->unique()
            ->values()
            ->all();
    }

    /**
     * Convert a database row into the frontend's expected verse format.
     */
    private function formatVerse(string $verseKey, object $row): array
    {
        return [
            'verse_key' => $verseKey,
            'relation_note' => $row->connection_explanation,
            'theme' => $row->theme,
            'topic_slug' => Str::slug($row->theme),
            'classification' => $row->classification,
            'source_status' => $row->source_status,
            'review_status' => $row->review_status,
            'tafsir_reference' => $row->tafsir_reference,
        ];
    }

    /**
     * GET /api/quran/cross-references?verse_key=2:155
     *
     * Finds other verses listed alongside the requested verse
     * in the same thematic cross-reference records.
     */
    public function getCrossReferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'verse_key' => [
                'required',
                'string',
                'regex:/^\d{1,3}:\d{1,3}$/',
            ],
        ]);

        $verseKey = $validated['verse_key'];

        $rows = DB::table('quran_cross_references')
            ->whereNotNull('verse_keys')
            ->get();

        $links = collect();

        foreach ($rows as $row) {
            $verseKeys = $this->parseVerseKeys($row->verse_keys);

            if (!in_array($verseKey, $verseKeys, true)) {
                continue;
            }

            foreach ($verseKeys as $relatedVerseKey) {
                if ($relatedVerseKey === $verseKey) {
                    continue;
                }

                $links->push(
                    $this->formatVerse($relatedVerseKey, $row)
                );
            }
        }

        // Avoid duplicate verse/theme combinations.
        $links = $links
            ->unique(fn ($item) => $item['theme'] . '|' . $item['verse_key'])
            ->sortBy([
                ['theme', 'asc'],
                ['verse_key', 'asc'],
            ])
            ->values();

        return response()->json([
            'success' => true,
            'current_verse' => $verseKey,
            'total' => $links->count(),
            'links' => $links,
        ]);
    }

    /**
     * GET /api/quran/topics
     *
     * Groups cross-reference records by theme.
     */
    public function getTopics(): JsonResponse
    {
        $rows = DB::table('quran_cross_references')
            ->whereNotNull('theme')
            ->whereNotNull('verse_keys')
            ->orderBy('theme')
            ->get();

        $topics = $rows
            ->groupBy('theme')
            ->map(function (Collection $items, string $theme) {

                $verses = collect();

                foreach ($items as $row) {
                    foreach ($this->parseVerseKeys($row->verse_keys) as $verseKey) {
                        $verses->push(
                            $this->formatVerse($verseKey, $row)
                        );
                    }
                }

                $verses = $verses
                    ->unique('verse_key')
                    ->sortBy('verse_key')
                    ->values();

                return [
                    'topic_title' => $theme,
                    'topic_slug' => Str::slug($theme),
                    'verse_count' => $verses->count(),
                    'verses' => $verses,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'total_topics' => $topics->count(),
            'topics' => $topics,
        ]);
    }


    /**
     * GET /api/quran/prophets
     *
     * Returns the full inventory of Quranic prophets.
     */
    public function getProphets(): JsonResponse
    {
        $prophets = DB::table('prophets_inventory')
            ->orderBy('prophet_no', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $prophets->count(),
            'prophets' => $prophets,
        ]);
    }

    /**
     * GET /api/quran/figures
     *
     * Returns righteous figures, rulers, and groups (e.g., Maryam, Khidr, Luqman).
     */
    public function getFigures(): JsonResponse
    {
        $figures = DB::table('other_figures_and_groups')
            ->orderBy('figure_or_group', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'total' => $figures->count(),
            'figures' => $figures,
        ]);
    }
    /**
     * GET /api/quran/search/topics?q=patience
     *
     * Searches themes, classifications, explanations,
     * and anchor story passages.
     */
    public function searchTopics(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => [
                'nullable',
                'string',
                'max:100',
            ],
        ]);

        $query = trim($validated['q'] ?? '');

        if ($query === '') {
            return response()->json([
                'success' => true,
                'query' => '',
                'total_topics' => 0,
                'thematic_results' => [],
            ]);
        }

        $rows = DB::table('quran_cross_references')
            ->where(function ($builder) use ($query) {
                $builder
                    ->where('theme', 'like', "%{$query}%")
                    ->orWhere('classification', 'like', "%{$query}%")
                    ->orWhere('connection_explanation', 'like', "%{$query}%")
                    ->orWhere('anchor_story_passages', 'like', "%{$query}%");
            })
            ->whereNotNull('theme')
            ->whereNotNull('verse_keys')
            ->orderBy('theme')
            ->get();

        $results = $rows
            ->groupBy('theme')
            ->map(function (Collection $items, string $theme) {

                $verses = collect();

                foreach ($items as $row) {
                    foreach ($this->parseVerseKeys($row->verse_keys) as $verseKey) {
                        $verses->push(
                            $this->formatVerse($verseKey, $row)
                        );
                    }
                }

                $verses = $verses
                    ->unique('verse_key')
                    ->sortBy('verse_key')
                    ->values();

                return [
                    'topic_title' => $theme,
                    'topic_slug' => Str::slug($theme),
                    'verse_count' => $verses->count(),
                    'verses' => $verses,
                ];
            })
            ->values();

        return response()->json([
            'success' => true,
            'query' => $query,
            'total_topics' => $results->count(),
            'thematic_results' => $results,
        ]);
    }

    /**
     * GET /api/quran/linker?verse_key=20:10
     *
     * Everything linked to the verse being read, in one response:
     * prophets, figures/groups, Musa story segment (+ parallel tellings)
     * and thematic cross-references (matched in both directions).
     */
    public function getLinks(Request $request, QuranLinkerService $linker): JsonResponse
    {
        $validated = $request->validate([
            'verse_key' => ['required', 'string', 'regex:/^\d{1,3}:\d{1,3}$/'],
        ]);

        [$surah, $ayah] = array_map('intval', explode(':', $validated['verse_key']));

        if ($surah < 1 || $surah > 114 || $ayah < 1 || $ayah > 286) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verse key.',
            ], 422);
        }

        $index = Cache::remember(
            self::LINKER_INDEX_CACHE_KEY,
            self::LINKER_INDEX_CACHE_TTL,
            fn () => $linker->buildIndex(
                DB::table('prophets_inventory')->get(),
                DB::table('other_figures_and_groups')->get(),
                DB::table('quran_cross_references')->get(),
                DB::table('quran_story_segments')->get(),
            )
        );

        return response()->json(
            ['success' => true] + $linker->linksFor($index, $surah, $ayah)
        );
    }
}