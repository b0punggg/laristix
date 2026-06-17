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
            $table->uuid('uuid')->unique();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained()->restrictOnDelete();
            $table->foreignId('registration_group_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('ticket_type_id')->constrained()->restrictOnDelete();
            $table->unsignedTinyInteger('seat_index')->default(1);
            $table->string('slot_key', 100)->nullable()->comment('Package slot key from package_config');
            $table->string('attendee_name')->nullable();
            $table->string('attendee_email')->nullable();
            $table->string('attendee_phone', 30)->nullable();
            $table->enum('status', ['pending', 'draft', 'confirmed', 'cancelled', 'checked_in', 'no_show'])->default('pending');
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->timestamps();

            $table->unique(['order_item_id', 'seat_index']);
            $table->index(['event_id', 'status']);
            $table->index(['organizer_id', 'event_id', 'created_at']);
            $table->index('order_id');
            $table->index(['event_id', 'attendee_email']);
            $table->index('attendee_email');
            $table->index('registration_group_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
