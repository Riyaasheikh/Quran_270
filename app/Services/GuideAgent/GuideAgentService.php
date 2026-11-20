<?php

namespace App\Services\GuideAgent;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GuideAgentService
{
    /**
     * Site routes available for React Router navigation.
     */
    protected array $siteRoutes = [
        [
            'path'        => '/',
            'title'       => 'Home Page',
            'description' => 'Main landing page, daily Ramadan/Fasting cards, and quick overview.',
        ],
        [
            'path'        => '/quran',
            'title'       => 'Quran Book Reader',
            'description' => 'Read the Holy Quran page-by-page in book view.',
        ],
        [
            'path'        => '/quran-explorer',
            'title'       => 'Quran & Prophetic Explorer',
            'description' => 'Explore Prophets stories, Thematic Explorer, and Quran cross-references.',
        ],
        [
            'path'        => '/surah/12',
            'title'       => 'Surah Yusuf (Story of Prophet Yusuf)',
            'description' => 'Read Surah Yusuf (Chapter 12) with translation, audio recitation, and verse links.',
        ],
        [
            'path'        => '/hadith',
            'title'       => 'Hadith Collection',
            'description' => 'Browse authentic Hadith books, chapters, and topics like patience, prayer, and character.',
        ],
        [
            'path'        => '/prayer-times',
            'title'       => 'Prayer Times',
            'description' => 'Daily Salah timings (Fajr, Dhuhr, Asr, Maghrib, Isha) based on user location.',
        ],
        [
            'path'        => '/mosques',
            'title'       => 'Mosque Finder',
            'description' => 'Find nearby mosques, distances, and mosque facilities.',
        ],
        [
            'path'        => '/zakat',
            'title'       => 'Zakat Calculator',
            'description' => 'Calculate Zakat on gold, silver, cash, and assets using live metal prices.',
        ],
        [
            'path'        => '/supplications',
            'title'       => 'Supplications (Duas)',
            'description' => 'Daily authentic Duas and remembrances.',
        ],
        [
            'path'        => '/fasting',
            'title'       => 'Fasting Hub',
            'description' => 'Suhoor, Iftar, and voluntary/Ramadan fasting guidance.',
        ],
        [
            'path'        => '/search',
            'title'       => 'Global Search',
            'description' => 'Search verses, Surahs, and topics across the Quran.',
        ],
        [
            'path'        => '/bookmarks',
            'title'       => 'Bookmarks',
            'description' => 'Saved Quran verses and study bookmarks.',
        ],
    ];

    public function ask(string $message, array $history = [], string $dbContext = ''): array
    {
        $apiKey       = config('services.gemini.api_key');
        $primaryModel = config('services.gemini.model', 'gemini-3.8-flash');

        if (empty($apiKey)) {
            return $this->fallbackResponse('Gemini API key is not configured on the server.');
        }

        $routesJson = json_encode($this->siteRoutes, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
        $cleanDbContext = trim($dbContext) !== '' ? $dbContext : 'No specific database records matched.';

        $systemInstruction = <<<PROMPT
You are "The Guide", an empathetic, knowledgeable Islamic Q&A assistant and Website Navigator for a Quran & Islamic Web App.

Your responsibilities:
1. Answer Islamic questions accurately, respectfully, and concisely using authentic Quranic verses and Hadith references when applicable. Never fabricate Hadith numbers, Quran verse numbers, or citations.
2. Act as a smart Website Navigator: whenever the user asks where to find a feature, prophet story, prayer times, zakat calculator, hadith topic, or mosque finder on this website, select the single best matching `path` from AVAILABLE SITE ROUTES below (for example: `/surah/12` or `/quran-explorer` for Prophet Yusuf, `/mosques` for mosques, `/prayer-times` for prayer times, `/zakat` for zakat, `/hadith` for hadith).
   - Set `navigation.has_route` to `true` when a route in AVAILABLE SITE ROUTES matches or helps the user.
   - Set `navigation.auto_navigate` to `true` ONLY when the user asks where to go, wants to open/find a page/feature/story on the site, or asks a navigation-intent question. Otherwise set `navigation.auto_navigate` to `false`.
   - Never invent a `path` that is not in AVAILABLE SITE ROUTES.
3. Ground your answer in DATABASE CONTEXT below whenever relevant records exist, and include relevant verse/story/reference labels in `citations`.

AVAILABLE SITE ROUTES:
{$routesJson}

DATABASE CONTEXT:
{$cleanDbContext}
PROMPT;

        $contents = [];
        foreach (array_slice($history, -6) as $turn) {
            $role = $turn['role'] ?? '';
            $text = trim((string) ($turn['text'] ?? ''));

            if ($text !== '' && in_array($role, ['user', 'assistant'], true)) {
                $contents[] = [
                    'role'  => $role === 'assistant' ? 'model' : 'user',
                    'parts' => [['text' => $text]],
                ];
            }
        }

        $contents[] = [
            'role'  => 'user',
            'parts' => [['text' => $message]],
        ];

        $payload = [
            'system_instruction' => [
                'parts' => [['text' => $systemInstruction]],
            ],
            'contents' => $contents,
            'generationConfig' => [
                'temperature'      => 0.35,
                'maxOutputTokens'  => 900,
                'responseMimeType' => 'application/json',
                'responseSchema'   => [
                    'type'       => 'OBJECT',
                    'properties' => [
                        'answer' => [
                            'type'        => 'STRING',
                            'description' => 'Clear, respectful, accurate response to the user.',
                        ],
                        'navigation' => [
                            'type'       => 'OBJECT',
                            'properties' => [
                                'has_route'     => ['type' => 'BOOLEAN'],
                                'auto_navigate' => ['type' => 'BOOLEAN'],
                                'path'          => ['type' => 'STRING'],
                                'label'         => ['type' => 'STRING'],
                            ],
                            'required' => ['has_route', 'auto_navigate', 'path', 'label'],
                        ],
                        'citations' => [
                            'type'  => 'ARRAY',
                            'items' => ['type' => 'STRING'],
                        ],
                    ],
                    'required' => ['answer', 'navigation', 'citations'],
                ],
            ],
        ];

        $attempts = [
            ['model' => $primaryModel, 'delay_ms' => 0],
            ['model' => $primaryModel, 'delay_ms' => 1200],
            ['model' => 'gemini-3.5-flash-lite', 'delay_ms' => 400],
        ];

        foreach ($attempts as $attempt) {
            if ($attempt['delay_ms'] > 0) {
                usleep($attempt['delay_ms'] * 1000);
            }

            $model = $attempt['model'];

            try {
                $url      = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$apiKey}";
                $response = Http::timeout(25)->post($url, $payload);

                if ($response->successful()) {
                    $rawText = data_get($response->json(), 'candidates.0.content.parts.0.text', '');
                    $parsed  = json_decode($rawText, true);

                    if (is_array($parsed) && !empty(trim((string) ($parsed['answer'] ?? '')))) {
                        return $this->normalizeResponse($parsed);
                    }

                    Log::warning("Gemini Guide model {$model} returned empty or non-JSON text", [
                        'raw' => $rawText,
                    ]);
                    continue;
                }

                $status = $response->status();
                Log::warning("Gemini Guide model {$model} returned {$status}", [
                    'body' => $response->body(),
                ]);

                if (!in_array($status, [404, 429, 500, 503], true)) {
                    break;
                }
            } catch (\Throwable $e) {
                Log::error("Gemini Guide Exception ({$model}): " . $e->getMessage());
            }
        }

        return $this->fallbackResponse('The AI service is temporarily busy. Please try again in a few seconds.');
    }

    protected function normalizeResponse(array $parsed): array
    {
        $allowedPaths = array_column($this->siteRoutes, 'path');
        $routeTitles  = array_column($this->siteRoutes, 'title', 'path');

        $rawNav  = is_array($parsed['navigation'] ?? null) ? $parsed['navigation'] : [];
        $rawPath = trim((string) ($rawNav['path'] ?? ''));

        $validPath = in_array($rawPath, $allowedPaths, true) ? $rawPath : '';
        $hasRoute  = $validPath !== '' && (bool) ($rawNav['has_route'] ?? true);

        $label = trim((string) ($rawNav['label'] ?? ''));
        if ($hasRoute && $label === '') {
            $label = $routeTitles[$validPath] ?? $validPath;
        }

        $citations = [];
        if (is_array($parsed['citations'] ?? null)) {
            foreach ($parsed['citations'] as $item) {
                $clean = trim((string) $item);
                if ($clean !== '') {
                    $citations[] = $clean;
                }
            }
        }

        return [
            'answer' => trim((string) $parsed['answer']),
            'navigation' => [
                'has_route'     => $hasRoute,
                'auto_navigate' => $hasRoute && (bool) ($rawNav['auto_navigate'] ?? false),
                'path'          => $hasRoute ? $validPath : '',
                'label'         => $hasRoute ? $label : '',
            ],
            'citations' => array_values(array_unique($citations)),
        ];
    }

    protected function fallbackResponse(string $message): array
    {
        return [
            'answer' => $message,
            'navigation' => [
                'has_route'     => false,
                'auto_navigate' => false,
                'path'          => '',
                'label'         => '',
            ],
            'citations' => [],
        ];
    }
}