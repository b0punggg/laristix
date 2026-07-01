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
            $table->foreignId('registration_id')->constrained('registrations', 'id', 'fk_reg_ans_regs')->cascadeOnDelete();
            $table->foreignId('form_field_id')->constrained('form_fields', 'id', 'fk_reg_ans_fld')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_reg_ans_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_reg_ans_events')->restrictOnDelete();
            $table->string('field_name', 100);
            $table->string('field_label');
            $table->text('value_text')->nullable();
            $table->json('value_json')->nullable();
            $table->timestamps();

            $table->unique(['registration_id', 'form_field_id'], 'uniq_reg_ans_pair');
            $table->index(['event_id', 'form_field_id'], 'idx_reg_ans_evt_fld');
            $table->index(['organizer_id', 'event_id'], 'idx_reg_ans_org_evt');
            $table->index('form_field_id', 'idx_reg_ans_fld');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_answers');
    }
};
