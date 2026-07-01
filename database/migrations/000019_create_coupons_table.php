<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 50)->unique('uniq_coupons_code');
            $table->string('name');
            $table->enum('scope', ['platform', 'organizer', 'event']);
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_coupons_org')->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events', 'id', 'fk_coupons_events')->cascadeOnDelete();
            $table->enum('discount_type', ['percentage', 'fixed']);
            $table->decimal('discount_value', 15, 2);
            $table->decimal('max_discount_amount', 15, 2)->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_count')->default(0);
            $table->unsignedTinyInteger('per_user_limit')->default(1);
            $table->decimal('min_order_amount', 15, 2)->nullable();
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users', 'id', 'fk_coupons_users')->restrictOnDelete();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['organizer_id', 'is_active'], 'idx_coupons_org_active');
            $table->index('event_id', 'idx_coupons_event');
            $table->index(['scope', 'is_active'], 'idx_coupons_scope');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
