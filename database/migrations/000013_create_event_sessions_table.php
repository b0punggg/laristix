<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_sess_events')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_evt_sess_org')->cascadeOnDelete();
            $table->foreignId('schedule_id')->nullable()->constrained('event_schedules', 'id', 'fk_evt_sess_sched')->nullOnDelete();
            $table->foreignId('venue_id')->nullable()->constrained('venues', 'id', 'fk_evt_sess_venues')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('session_type', ['keynote', 'workshop', 'breakout', 'networking', 'other'])->default('other');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->unsignedInteger('capacity')->nullable();
            $table->unsignedInteger('registered_count')->default(0);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_id', 'start_at'], 'idx_evt_sess_start');
            $table->index('organizer_id', 'idx_evt_sess_org');
            $table->index('schedule_id', 'idx_evt_sess_sched');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_sessions');
    }
};
