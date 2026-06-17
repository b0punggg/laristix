<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referrals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('referral_code_id')->constrained()->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->foreignId('referred_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('referred_email')->nullable();
            $table->enum('status', ['clicked', 'registered', 'converted', 'paid', 'commissioned', 'void'])->default('clicked');
            $table->decimal('order_amount', 15, 2)->nullable();
            $table->decimal('commission_amount', 15, 2)->nullable();
            $table->enum('commission_status', ['pending', 'approved', 'paid', 'void'])->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['referral_code_id', 'status']);
            $table->index(['event_id', 'status']);
            $table->index(['organizer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
