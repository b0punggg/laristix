<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('refunds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained('payments', 'id', 'fk_refunds_payments')->restrictOnDelete();
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_refunds_orders')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_refunds_org')->restrictOnDelete();
            $table->string('gateway_refund_id', 100)->nullable();
            $table->decimal('amount', 15, 2);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'processing', 'success', 'failed'])->default('pending');
            $table->foreignId('initiated_by')->constrained('users', 'id', 'fk_refunds_users')->restrictOnDelete();
            $table->json('gateway_response')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index('payment_id', 'idx_refunds_payment');
            $table->index('order_id', 'idx_refunds_order');
            $table->index(['organizer_id', 'status'], 'idx_refunds_org_stat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
