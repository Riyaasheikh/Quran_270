<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // Table for thematic and inter-surah cross-references
        Schema::create('quran_cross_references', function (Blueprint $table) {
            $table->id();
            $table->string('theme');
            $table->string('anchor_story_passages');
            $table->integer('surah_number');
            $table->string('surah_name');
            $table->integer('ayah_start');
            $table->integer('ayah_end');
            $table->string('verse_keys');
            $table->string('classification');
            $table->text('connection_explanation');
            $table->text('tafsir_reference');
            $table->string('source_status');
            $table->string('review_status');
            $table->timestamps();
        });

        // Table for chronological and thematic story segments (Musa AS)
        Schema::create('quran_story_segments', function (Blueprint $table) {
            $table->id();
            $table->string('story_id');
            $table->string('story_title');
            $table->string('story_segment');
            $table->integer('surah_number');
            $table->string('surah_name');
            $table->integer('ayah_start');
            $table->integer('ayah_end');
            $table->string('verse_keys');
            $table->string('relationship_type');
            $table->text('narrative_summary');
            $table->text('connection_explanation');
            $table->text('tafsir_reference');
            $table->string('source_status');
            $table->string('review_status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quran_cross_references');
        Schema::dropIfExists('quran_story_segments');
    }
};