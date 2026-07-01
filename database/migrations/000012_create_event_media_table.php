<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_media', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_media_events')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_evt_media_org')->cascadeOnDelete();
            $table->enum('type', ['image', 'document', 'video']);
            $table->string('url', 500);
            $table->string('alt_text')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['event_id', 'sort_order'], 'idx_evt_media_sort');
            $table->index('organizer_id', 'idx_evt_media_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_media');
    }
};
