<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tickets', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('registration_id')->unique()->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('ticket_type_id')->constrained()->restrictOnDelete();
            $table->string('ticket_code', 32)->unique();
            $table->char('qr_token_hash', 64)->unique();
            $table->enum('status', ['valid', 'used', 'cancelled', 'expired'])->default('valid');
            $table->timestamp('issued_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('pdf_url', 500)->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status']);
            $table->index(['organizer_id', 'event_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
