<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('form_field_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('field_id')->constrained('form_fields', 'id', 'fk_form_opt_fld')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_form_opt_org')->cascadeOnDelete();
            $table->string('label');
            $table->string('value');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['field_id', 'sort_order'], 'idx_form_opt_sort');
            $table->index('organizer_id', 'idx_form_opt_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('form_field_options');
    }
};
