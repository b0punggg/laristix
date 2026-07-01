<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique('uniq_events_uuid');
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_events_org')->restrictOnDelete();
            $table->foreignId('venue_id')->nullable()->constrained('venues', 'id', 'fk_events_venues')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('event_categories', 'id', 'fk_events_evt_cat')->nullOnDelete();
            $table->foreignId('created_by')->constrained('users', 'id', 'fk_events_users')->restrictOnDelete();
            $table->string('title');
            $table->string('slug');
            $table->longText('description')->nullable();
            $table->string('short_description', 500)->nullable();
            $table->string('banner_url', 500)->nullable();
            $table->enum('status', ['draft', 'published', 'live', 'completed', 'cancelled'])->default('draft');
            $table->enum('visibility', ['public', 'private', 'unlisted'])->default('public');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->string('timezone', 50);
            $table->unsignedInteger('capacity')->nullable();
            $table->boolean('is_free')->default(false);
            $table->json('settings')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organizer_id', 'slug'], 'uniq_events_org_slug');
            $table->index(['organizer_id', 'status', 'start_at'], 'idx_events_org_stat_start');
            $table->index(['status', 'start_at'], 'idx_events_stat_start');
            $table->index(['organizer_id', 'created_at'], 'idx_events_org_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
