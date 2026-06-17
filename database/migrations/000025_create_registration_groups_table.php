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
            $table->foreignId('organizer_id')->constrained()->restrictOnDelete();
            $table->foreignId('event_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_id')->constrained()->restrictOnDelete();
            $table->foreignId('order_item_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('company_name')->nullable();
            $table->string('contact_name');
            $table->string('contact_email');
            $table->string('contact_phone', 30)->nullable();
            $table->unsignedInteger('expected_count');
            $table->unsignedInteger('completed_count')->default(0);
            $table->enum('status', ['open', 'complete', 'closed', 'cancelled'])->default('open');
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['organizer_id', 'event_id']);
            $table->index('order_item_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registration_groups');
    }
};
