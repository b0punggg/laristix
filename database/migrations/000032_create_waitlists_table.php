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
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('ticket_type_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('session_id')->nullable()->constrained('event_sessions')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('email');
            $table->string('name');
            $table->string('phone', 30)->nullable();
            $table->unsignedTinyInteger('quantity')->default(1);
            $table->enum('status', ['waiting', 'notified', 'converted', 'expired', 'cancelled'])->default('waiting');
            $table->unsignedInteger('priority')->default(0);
            $table->timestamp('notified_at')->nullable();
            $table->foreignId('converted_order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['event_id', 'status', 'created_at']);
            $table->index(['ticket_type_id', 'status']);
            $table->index(['organizer_id', 'status']);
            $table->index(['event_id', 'email', 'ticket_type_id', 'status'], 'waitlists_active_lookup_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('waitlists');
    }
};
