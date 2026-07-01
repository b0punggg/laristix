<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_forms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_reg_forms_events')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_reg_forms_org')->cascadeOnDelete();
            $table->string('title')->default('Registration Form');
            $table->text('description')->nullable();
            $table->json('settings')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique('event_id', 'uniq_reg_forms_event');
            $table->index('organizer_id', 'idx_reg_forms_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_forms');
    }
};
