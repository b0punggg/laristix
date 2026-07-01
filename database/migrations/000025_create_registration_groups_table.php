<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registration_groups', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_reg_groups_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_reg_groups_events')->restrictOnDelete();
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_reg_groups_orders')->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained('order_items', 'id', 'fk_reg_groups_items')->restrictOnDelete();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone', 30)->nullable();
            $table->unsignedInteger('expected_count');
            $table->unsignedInteger('completed_count')->default(0);
            $table->enum('status', ['open', 'complete', 'closed', 'cancelled'])->default('open');
            $table->timestamps();

            $table->index(['order_id', 'status'], 'idx_reg_groups_order');
            $table->index(['organizer_id', 'event_id'], 'idx_reg_groups_org_evt');
            $table->index('order_item_id', 'idx_reg_groups_item');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_groups');
    }
};
