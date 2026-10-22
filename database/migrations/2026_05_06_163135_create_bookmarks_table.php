<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
       Schema::create('bookmarks', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained();
    $table->integer('surah_id');
    $table->integer('verse_number');
    $table->string('verse_key'); 
    $table->integer('translation_id')->default(85);
    $table->timestamps();
});
    }

    public function down(): void
    {
        Schema::dropIfExists('bookmarks');
    }
};
