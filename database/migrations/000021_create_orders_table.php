<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('order_number', 32)->unique();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('buyer_name');
            $table->string('buyer_email');
            $table->string('buyer_phone', 30)->nullable();
            $table->enum('status', [
                'pending', 'awaiting_payment', 'paid', 'completed',
                'expired', 'cancelled', 'refunded', 'partially_refunded',
            ])->default('pending');
            $table->char('currency', 3)->default('IDR');
            $table->decimal('subtotal', 15, 2)->default(0);
            $table->decimal('discount_amount', 15, 2)->default(0);
            $table->decimal('platform_fee_pct_rate', 5, 2)->default(0);
            $table->decimal('platform_fee_flat', 15, 2)->default(0);
            $table->decimal('platform_fee_total', 15, 2)->default(0);
            $table->enum('fee_bearer', ['attendee', 'organizer'])->default('attendee');
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->decimal('organizer_net_amount', 15, 2)->default(0);
            $table->foreignId('promo_code_id')->nullable()->constrained()->nullOnDelete();
            $table->string('promo_code_snapshot', 50)->nullable();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->string('coupon_snapshot', 50)->nullable();
            $table->foreignId('referral_code_id')->nullable()->constrained()->nullOnDelete();
            $table->string('idempotency_key', 64)->nullable()->unique();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['organizer_id', 'status', 'created_at']);
            $table->index(['event_id', 'status']);
            $table->index('buyer_email');
            $table->index(['status', 'expires_at']);
            $table->index(['user_id', 'created_at']);
            $table->index(['organizer_id', 'event_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
