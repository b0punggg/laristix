<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_event_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_daily_evt_events')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_daily_evt_org')->cascadeOnDelete();
            $table->date('stat_date');
            $table->unsignedInteger('orders_count')->default(0);
            $table->unsignedInteger('registrations_count')->default(0);
            $table->decimal('revenue_gross', 15, 2)->default(0);
            $table->decimal('revenue_net', 15, 2)->default(0);
            $table->decimal('platform_fees', 15, 2)->default(0);
            $table->unsignedInteger('check_ins_count')->default(0);
            $table->timestamps();

            $table->unique(['event_id', 'stat_date'], 'uniq_daily_evt_date');
            $table->index(['organizer_id', 'stat_date'], 'idx_daily_evt_org_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_event_stats');
    }
};
