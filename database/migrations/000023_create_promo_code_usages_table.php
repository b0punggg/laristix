<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('promo_code_usages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('promo_code_id')->constrained('promo_codes', 'id', 'fk_promo_usage_promo')->restrictOnDelete();
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_promo_usage_orders')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_promo_usage_org')->restrictOnDelete();
            $table->decimal('discount_applied', 15, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->unique('order_id', 'uniq_promo_usage_order');
            $table->index('promo_code_id', 'idx_promo_usage_promo');
            $table->index('organizer_id', 'idx_promo_usage_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_code_usages');
    }
};
