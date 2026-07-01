<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('form_id')->constrained('registration_forms', 'id', 'fk_form_fld_forms')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_form_fld_org')->cascadeOnDelete();
            $table->string('label');
            $table->string('name', 100);
            $table->enum('type', [
                'text', 'email', 'phone', 'number', 'textarea',
                'select', 'radio', 'checkbox', 'date', 'datetime', 'file', 'hidden',
            ]);
            $table->string('placeholder')->nullable();
            $table->string('help_text', 500)->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_unique_per_event')->default(false);
            $table->json('validation_rules')->nullable();
            $table->text('default_value')->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['form_id', 'name'], 'uniq_form_fld_name');
            $table->index(['form_id', 'sort_order'], 'idx_form_fld_sort');
            $table->index('organizer_id', 'idx_form_fld_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_fields');
    }
};
