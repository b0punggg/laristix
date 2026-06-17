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
            $table->foreignId('ticket_id')->constrained()->restrictOnDelete();
            $table->foreignId('registration_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('gate_id')->nullable()->constrained('check_in_gates')->nullOnDelete();
            $table->foreignId('scanned_by')->constrained('users')->restrictOnDelete();
            $table->enum('method', ['qr_scan', 'manual', 'api'])->default('qr_scan');
            $table->string('device_info')->nullable();
            $table->timestamp('checked_in_at');
            $table->timestamp('created_at')->useCurrent();

            $table->index(['ticket_id', 'checked_in_at']);
            $table->index(['event_id', 'checked_in_at']);
            $table->index(['organizer_id', 'event_id', 'checked_in_at']);
            $table->index(['scanned_by', 'checked_in_at']);
            $table->index('registration_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_ins');
    }
};
