<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_sched_events')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_evt_sched_org')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['event_id', 'sort_order'], 'idx_evt_sched_sort');
            $table->index('organizer_id', 'idx_evt_sched_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_schedules');
    }
};
