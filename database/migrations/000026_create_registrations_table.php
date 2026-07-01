<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique('uniq_regs_uuid');
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_regs_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_regs_events')->restrictOnDelete();
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_regs_orders')->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items', 'id', 'fk_regs_items')->restrictOnDelete();
            $table->foreignId('registration_group_id')->nullable()->constrained('registration_groups', 'id', 'fk_regs_groups')->nullOnDelete();
            $table->foreignId('ticket_type_id')->constrained('ticket_types', 'id', 'fk_regs_tkt')->restrictOnDelete();
            $table->unsignedTinyInteger('seat_index')->default(1);
            $table->string('slot_key', 100)->nullable()->comment('Package slot key from package_config');
            $table->string('attendee_name')->nullable();
            $table->string('attendee_email')->nullable();
            $table->string('attendee_phone', 30)->nullable();
            $table->enum('status', ['pending', 'draft', 'confirmed', 'cancelled', 'checked_in', 'no_show'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(['order_item_id', 'seat_index'], 'uniq_regs_item_seat');
            $table->index(['event_id', 'status'], 'idx_regs_event_stat');
            $table->index(['organizer_id', 'event_id', 'created_at'], 'idx_regs_org_evt');
            $table->index('order_id', 'idx_regs_order');
            $table->index(['event_id', 'attendee_email'], 'idx_regs_evt_email');
            $table->index('attendee_email', 'idx_regs_email');
            $table->index('registration_group_id', 'idx_regs_group');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
