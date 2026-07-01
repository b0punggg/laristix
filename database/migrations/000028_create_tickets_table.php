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
            $table->uuid('uuid')->unique('uniq_tickets_uuid');
            $table->foreignId('registration_id')->unique('uniq_tickets_reg')->constrained('registrations', 'id', 'fk_tickets_regs')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_tickets_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_tickets_events')->restrictOnDelete();
            $table->foreignId('ticket_type_id')->constrained('ticket_types', 'id', 'fk_tickets_tkt')->restrictOnDelete();
            $table->string('ticket_code', 32)->unique('uniq_tickets_code');
            $table->char('qr_token_hash', 64)->unique('uniq_tickets_qr_hash');
            $table->enum('status', ['valid', 'used', 'cancelled', 'expired'])->default('valid');
            $table->timestamp('issued_at');
            $table->timestamp('used_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('pdf_url', 500)->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status'], 'idx_tickets_event_stat');
            $table->index(['organizer_id', 'event_id'], 'idx_tickets_org_evt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tickets');
    }
};
