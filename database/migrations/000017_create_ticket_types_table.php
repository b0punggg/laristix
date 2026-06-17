<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ticket_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->char('currency', 3)->default('IDR');
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('sold_count')->default(0);
            $table->unsignedInteger('reserved_count')->default(0);
            $table->unsignedTinyInteger('min_per_order')->default(1);
            $table->unsignedTinyInteger('max_per_order')->default(10);
            $table->enum('package_type', ['individual', 'couple', 'family', 'group', 'corporate', 'custom'])->default('individual');
            $table->unsignedTinyInteger('min_registrations_per_unit')->default(1);
            $table->unsignedTinyInteger('max_registrations_per_unit')->default(1);
            $table->json('package_config')->nullable()->comment('Slot definitions, partial completion, corporate rules');
            $table->enum('registration_mode', ['individual', 'group', 'corporate'])->default('individual');
            $table->unsignedTinyInteger('min_registrations_to_complete')->nullable();
            $table->timestamp('sales_start_at')->nullable();
            $table->timestamp('sales_end_at')->nullable();
            $table->enum('visibility', ['public', 'hidden', 'invite_only'])->default('public');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->enum('status', ['active', 'sold_out', 'hidden', 'archived'])->default('active');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['event_id', 'status', 'sort_order']);
            $table->index('organizer_id');
            $table->index(['event_id', 'sales_start_at', 'sales_end_at']);
            $table->index(['organizer_id', 'package_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ticket_types');
    }
};
