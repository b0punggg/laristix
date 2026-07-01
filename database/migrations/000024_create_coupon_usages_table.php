<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupon_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coupon_id')->constrained('coupons', 'id', 'fk_coupon_usage_coupon')->restrictOnDelete();
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_coupon_usage_orders')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_coupon_usage_org')->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users', 'id', 'fk_coupon_usage_users')->nullOnDelete();
            $table->decimal('discount_applied', 15, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['coupon_id', 'order_id'], 'uniq_coupon_usage_pair');
            $table->index('coupon_id', 'idx_coupon_usage_coupon');
            $table->index(['user_id', 'coupon_id'], 'idx_coupon_usage_user');
            $table->index('organizer_id', 'idx_coupon_usage_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupon_usages');
    }
};
