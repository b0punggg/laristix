<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('waitlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_waitlists_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_waitlists_events')->restrictOnDelete();
            $table->foreignId('ticket_type_id')->nullable()->constrained('ticket_types', 'id', 'fk_waitlists_tkt')->nullOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('event_sessions', 'id', 'fk_waitlists_sess')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users', 'id', 'fk_waitlists_users')->nullOnDelete();
            $table->string('email');
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->unsignedTinyInteger('quantity')->default(1);
            $table->enum('status', ['waiting', 'notified', 'converted', 'expired', 'cancelled'])->default('waiting');
            $table->unsignedInteger('priority')->default(0);
            $table->timestamp('notified_at')->nullable();
            $table->foreignId('converted_order_id')->nullable()->constrained('orders', 'id', 'fk_waitlists_orders')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status', 'created_at'], 'idx_waitlists_evt_stat');
            $table->index(['ticket_type_id', 'status'], 'idx_waitlists_tkt_stat');
            $table->index(['organizer_id', 'status'], 'idx_waitlists_org_stat');
            $table->index(['event_id', 'email', 'ticket_type_id', 'status'], 'idx_waitlists_lookup');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlists');
    }
};
