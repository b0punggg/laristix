<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('referral_codes', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique('uniq_ref_codes_code');
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_ref_codes_org')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users', 'id', 'fk_ref_codes_users')->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events', 'id', 'fk_ref_codes_events')->cascadeOnDelete();
            $table->enum('commission_type', ['percentage', 'fixed'])->nullable();
            $table->decimal('commission_value', 15, 2)->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organizer_id', 'is_active'], 'idx_ref_codes_active');
            $table->index('event_id', 'idx_ref_codes_event');
            $table->index('user_id', 'idx_ref_codes_user');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('referral_codes');
    }
};
