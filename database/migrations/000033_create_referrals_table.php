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
            $table->foreignId('referral_code_id')->constrained('referral_codes', 'id', 'fk_referrals_ref_code')->restrictOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_referrals_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_referrals_events')->restrictOnDelete();
            $table->foreignId('order_id')->nullable()->unique('uniq_referrals_order')->constrained('orders', 'id', 'fk_referrals_orders')->nullOnDelete();
            $table->foreignId('referred_user_id')->nullable()->constrained('users', 'id', 'fk_referrals_users')->nullOnDelete();
            $table->string('referred_email')->nullable();
            $table->enum('status', ['clicked', 'registered', 'converted', 'paid', 'commissioned', 'void'])->default('clicked');
            $table->decimal('order_amount', 15, 2)->nullable();
            $table->decimal('commission_amount', 15, 2)->nullable();
            $table->enum('commission_status', ['pending', 'approved', 'paid', 'void'])->nullable();
            $table->timestamp('converted_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['referral_code_id', 'status'], 'idx_referrals_code_stat');
            $table->index(['event_id', 'status'], 'idx_referrals_evt_stat');
            $table->index(['organizer_id', 'status'], 'idx_referrals_org_stat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referrals');
    }
};
