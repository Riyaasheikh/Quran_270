<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class QuranStorySeeder extends Seeder
{
    public function run(): void
    {
        $storyCsv = database_path('seeders/data/musa_story_candidates.csv');
        
        if (file_exists($storyCsv)) {
            $file = fopen($storyCsv, 'r');
            $header = fgetcsv($file); // Skip header

            while (($row = fgetcsv($file)) !== false) {
                if (count($row) < 14) continue;

                DB::table('quran_story_segments')->updateOrInsert(
                    [
                        'story_id'   => $row[0],
                        'verse_keys' => $row[7],
                    ],
                    [
                        'story_title'            => $row[1],
                        'story_segment'          => $row[2],
                        'surah_number'           => (int)$row[3],
                        'surah_name'             => $row[4],
                        'ayah_start'             => (int)$row[5],
                        'ayah_end'               => (int)$row[6],
                        'relationship_type'      => $row[8],
                        'narrative_summary'      => $row[9],
                        'connection_explanation' => $row[10],
                        'tafsir_reference'       => $row[11],
                        'source_status'          => $row[12],
                        'review_status'          => $row[13],
                        'created_at'             => now(),
                        'updated_at'             => now(),
                    ]
                );
            }
            fclose($file);
        }
    }
}