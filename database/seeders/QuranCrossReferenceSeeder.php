<?php

namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class QuranCrossReferenceSeeder extends Seeder
{
    public function run(): void
    {
        $csvPath = database_path(
            'seeders/data/musa_cross_references.csv'
        );

        if (!file_exists($csvPath)) {
            throw new RuntimeException(
                "Cross-reference CSV not found: {$csvPath}"
            );
        }

        $file = fopen($csvPath, 'r');

        if ($file === false) {
            throw new RuntimeException(
                'Unable to open cross-reference CSV.'
            );
        }

        try {
            $header = fgetcsv($file);

            if ($header === false) {
                throw new RuntimeException(
                    'Cross-reference CSV is empty.'
                );
            }

            $imported = 0;
            $skipped = 0;

            while (($row = fgetcsv($file)) !== false) {

                if (count($row) < 12) {
                    $skipped++;
                    continue;
                }

                $theme = trim($row[0]);
                $verseKeys = trim($row[6]);

                if ($theme === '' || $verseKeys === '') {
                    $skipped++;
                    continue;
                }

                DB::table('quran_cross_references')
                    ->updateOrInsert(
                        [
                            'theme' => $theme,
                            'verse_keys' => $verseKeys,
                        ],
                        [
                            'anchor_story_passages' => trim($row[1]),
                            'surah_number' => (int) $row[2],
                            'surah_name' => trim($row[3]),
                            'ayah_start' => (int) $row[4],
                            'ayah_end' => (int) $row[5],
                            'classification' => trim($row[7]),
                            'connection_explanation' => trim($row[8]),
                            'tafsir_reference' => trim($row[9]),
                            'source_status' => trim($row[10]),
                            'review_status' => trim($row[11]),
                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );

                $imported++;
            }

            $this->command?->info(
                "Cross-references processed: {$imported}"
            );

            $this->command?->info(
                "Rows skipped: {$skipped}"
            );
        } finally {
            fclose($file);
        }
    }
}
