<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('organizer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('gateway', 30);
            $table->string('event_type', 50);
            $table->string('gateway_event_id', 100)->nullable();
            $table->json('payload');
            $table->unsignedSmallInteger('response_status')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['gateway', 'gateway_event_id']);
            $table->index(['payment_id', 'created_at']);
            $table->index(['order_id', 'created_at']);
            $table->index(['processed', 'created_at']);
            $table->index('organizer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_logs');
    }
};
