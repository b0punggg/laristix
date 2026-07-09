<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_category_event', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_cat_evt_events')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('event_categories', 'id', 'fk_evt_cat_evt_cats')->cascadeOnDelete();

            $table->primary(['event_id', 'category_id'], 'pk_event_category_event');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_category_event');
    }
};
