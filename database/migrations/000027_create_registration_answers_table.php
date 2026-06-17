<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registration_id')->constrained()->cascadeOnDelete();
            $table->foreignId('form_field_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->string('field_name', 100);
            $table->string('field_label');
            $table->text('value_text')->nullable();
            $table->json('value_json')->nullable();
            $table->timestamps();

            $table->unique(['registration_id', 'form_field_id']);
            $table->index(['event_id', 'form_field_id']);
            $table->index(['organizer_id', 'event_id']);
            $table->index('form_field_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_answers');
    }
};
