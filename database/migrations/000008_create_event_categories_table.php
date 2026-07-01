<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_evt_cat_org')->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('slug', 100);
            $table->string('icon', 50)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['organizer_id', 'slug'], 'uniq_evt_cat_slug');
            $table->index('is_active', 'idx_evt_cat_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_categories');
    }
};
