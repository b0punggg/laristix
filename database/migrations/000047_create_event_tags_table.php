<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_tags', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_evt_tags_org')->nullOnDelete();
            $table->string('name');
            $table->string('slug');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['organizer_id', 'slug'], 'uniq_evt_tags_org_slug');
            $table->index('organizer_id', 'idx_evt_tags_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_tags');
    }
};
