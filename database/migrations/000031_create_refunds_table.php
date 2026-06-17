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
            $table->foreignId('payment_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->string('gateway_refund_id', 100)->nullable();
            $table->decimal('amount', 15, 2);
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'processing', 'success', 'failed'])->default('pending');
            $table->foreignId('initiated_by')->constrained('users')->restrictOnDelete();
            $table->json('gateway_response')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();

            $table->index('payment_id');
            $table->index('order_id');
            $table->index(['organizer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('refunds');
    }
};
