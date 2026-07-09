<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_tag', function (Blueprint $table) {
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_tag_events')->cascadeOnDelete();
            $table->foreignId('tag_id')->constrained('event_tags', 'id', 'fk_evt_tag_tags')->cascadeOnDelete();

            $table->primary(['event_id', 'tag_id'], 'pk_event_tag');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_tag');
    }
};
