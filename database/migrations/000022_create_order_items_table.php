<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders', 'id', 'fk_order_items_orders')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_order_items_org')->restrictOnDelete();
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_order_items_events')->restrictOnDelete();
            $table->foreignId('ticket_type_id')->constrained('ticket_types', 'id', 'fk_order_items_tkt')->restrictOnDelete();
            $table->string('ticket_type_name');
            $table->decimal('unit_price', 15, 2);
            $table->unsignedTinyInteger('quantity');
            $table->decimal('subtotal', 15, 2);
            $table->enum('package_type_snapshot', ['individual', 'couple', 'family', 'group', 'corporate', 'custom'])->default('individual');
            $table->unsignedTinyInteger('min_registrations_per_unit_snapshot')->default(1);
            $table->unsignedTinyInteger('max_registrations_per_unit_snapshot')->default(1);
            $table->json('package_config_snapshot')->nullable();
            $table->timestamps();

            $table->index('order_id', 'idx_order_items_order');
            $table->index('ticket_type_id', 'idx_order_items_tkt');
            $table->index(['organizer_id', 'event_id'], 'idx_order_items_org_evt');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
