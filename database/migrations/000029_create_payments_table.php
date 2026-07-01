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
            $table->uuid('uuid')->unique('uniq_payments_uuid');
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_payments_orders')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_payments_org')->restrictOnDelete();
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

            $table->unique(['gateway', 'gateway_transaction_id'], 'uniq_payments_gateway_tx');
            $table->index('order_id', 'idx_payments_order');
            $table->index(['organizer_id', 'status', 'created_at'], 'idx_payments_org_stat');
            $table->index(['status', 'created_at'], 'idx_payments_stat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
