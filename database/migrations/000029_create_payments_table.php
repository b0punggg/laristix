<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->string('gateway', 30)->default('midtrans');
            $table->string('gateway_transaction_id', 100);
            $table->string('payment_method', 50)->nullable();
            $table->enum('status', [
                'pending', 'processing', 'success', 'failed',
                'expired', 'refunded', 'partially_refunded',
            ])->default('pending');
            $table->decimal('amount', 15, 2);
            $table->char('currency', 3)->default('IDR');
            $table->json('gateway_response')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('expired_at')->nullable();
            $table->timestamps();

            $table->unique(['gateway', 'gateway_transaction_id']);
            $table->index('order_id');
            $table->index(['organizer_id', 'status', 'created_at']);
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
