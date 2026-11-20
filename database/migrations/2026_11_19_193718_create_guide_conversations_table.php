<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('guide_conversations', function (Blueprint $table) {
            $table->id();
            $table->string('session_id', 64)->index();
            $table->text('user_message');
            $table->longText('assistant_reply');
            $table->string('navigation_path')->nullable();
            $table->string('navigation_label')->nullable();
            $table->json('citations')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('guide_conversations');
    }
};