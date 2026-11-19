<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProphetAndFigureSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Prophets Inventory
        $prophetCsv = database_path('seeders/data/prophets_inventory_batch1.csv');
        if (file_exists($prophetCsv)) {
            $file = fopen($prophetCsv, 'r');
            fgetcsv($file); // Skip header

            while (($row = fgetcsv($file)) !== false) {
                if (count($row) < 9) continue;

                DB::table('prophets_inventory')->updateOrInsert(
                    ['prophet_no' => (int)$row[0]],
                    [
                        'prophet_name'              => $row[1],
                        'name_ar'                   => $row[2],
                        'other_forms'               => $row[3],
                        'quranic_status_note'       => $row[4],
                        'principal_passage_anchors' => $row[5],
                        'proposed_segments'         => $row[6],
                        'flags_and_do_not_assume'   => $row[7],
                        'status'                    => $row[8],
                        'created_at'                => now(),
                        'updated_at'                => now(),
                    ]
                );
            }
            fclose($file);
        }

        // 2. Seed Other Figures & Groups
        $figureCsv = database_path('seeders/data/other_figures_and_groups_batch1.csv');
        if (file_exists($figureCsv)) {
            $file = fopen($figureCsv, 'r');
            fgetcsv($file); // Skip header

            while (($row = fgetcsv($file)) !== false) {
                if (count($row) < 7) continue;

                DB::table('other_figures_and_groups')->updateOrInsert(
                    ['figure_or_group' => $row[0]],
                    [
                        'figure_type'             => $row[1],
                        'identity_status'         => $row[2],
                        'principal_anchors'       => $row[3],
                        'linked_prophets'         => $row[4],
                        'do_not_assume_or_flags'  => $row[5],
                        'status'                  => $row[6],
                        'created_at'              => now(),
                        'updated_at'              => now(),
                    ]
                );
            }
            fclose($file);
        }
    }
}