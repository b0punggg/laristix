<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_ins', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ticket_id')->constrained('tickets', 'id', 'fk_chk_ins_tickets')->restrictOnDelete();
            $table->foreignId('registration_id')->constrained('registrations', 'id', 'fk_chk_ins_regs')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_chk_ins_events')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_chk_ins_org')->restrictOnDelete();
            $table->foreignId('gate_id')->nullable()->constrained('check_in_gates', 'id', 'fk_chk_ins_gates')->nullOnDelete();
            $table->foreignId('scanned_by')->constrained('users', 'id', 'fk_chk_ins_users')->restrictOnDelete();
            $table->enum('method', ['qr_scan', 'manual', 'api'])->default('qr_scan');
            $table->string('device_info')->nullable();
            $table->timestamp('checked_in_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['ticket_id', 'checked_in_at'], 'idx_chk_ins_ticket');
            $table->index(['event_id', 'checked_in_at'], 'idx_chk_ins_event');
            $table->index(['organizer_id', 'event_id', 'checked_in_at'], 'idx_chk_ins_org_evt');
            $table->index(['scanned_by', 'checked_in_at'], 'idx_chk_ins_scanner');
            $table->index('registration_id', 'idx_chk_ins_reg');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
