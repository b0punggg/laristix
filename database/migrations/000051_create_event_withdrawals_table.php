<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_withdrawals', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique('uniq_event_withdrawals_uuid');
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_evt_withdrawals_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_withdrawals_event')->restrictOnDelete();
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['pending', 'processing', 'paid', 'rejected'])->default('pending');
            $table->string('bank_name', 100);
            $table->string('account_holder', 150);
            $table->string('account_number', 50);
            $table->string('notes')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status'], 'idx_evt_withdrawals_event_status');
            $table->index(['organizer_id', 'created_at'], 'idx_evt_withdrawals_org_created');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_withdrawals');
    }
};
