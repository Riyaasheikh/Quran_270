<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('prophets_inventory', function (Blueprint $table) {
            $table->id();
            $table->integer('prophet_no');
            $table->string('prophet_name');
            $table->string('name_ar');
            $table->string('other_forms')->nullable();
            $table->text('quranic_status_note');
            $table->text('principal_passage_anchors');
            $table->text('proposed_segments');
            $table->text('flags_and_do_not_assume');
            $table->string('status');
            $table->timestamps();
        });

        Schema::create('other_figures_and_groups', function (Blueprint $table) {
            $table->id();
            $table->string('figure_or_group');
            $table->string('figure_type');
            $table->string('identity_status');
            $table->text('principal_anchors');
            $table->string('linked_prophets');
            $table->text('do_not_assume_or_flags');
            $table->string('status');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('prophets_inventory');
        Schema::dropIfExists('other_figures_and_groups');
    }
};