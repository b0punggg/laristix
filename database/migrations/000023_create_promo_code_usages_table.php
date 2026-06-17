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
            $table->foreignId('promo_code_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->decimal('discount_applied', 15, 2);
            $table->timestamp('created_at')->useCurrent();

            $table->unique('order_id');
            $table->index('promo_code_id');
            $table->index('organizer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('promo_code_usages');
    }
};
