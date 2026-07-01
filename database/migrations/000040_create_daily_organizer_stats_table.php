<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_organizer_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_daily_org_org')->cascadeOnDelete();
            $table->date('stat_date');
            $table->unsignedInteger('events_active')->default(0);
            $table->unsignedInteger('orders_count')->default(0);
            $table->unsignedInteger('registrations_count')->default(0);
            $table->decimal('revenue_gross', 15, 2)->default(0);
            $table->decimal('platform_fees', 15, 2)->default(0);
            $table->timestamps();

            $table->unique(['organizer_id', 'stat_date'], 'uniq_daily_org_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_organizer_stats');
    }
};
