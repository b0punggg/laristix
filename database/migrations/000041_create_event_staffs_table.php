<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('event_staffs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('organizer_member_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('role', ['manager', 'coordinator', 'staff', 'scanner'])->default('staff');
            $table->json('permissions')->nullable()->comment('Future granular event permissions');
            $table->foreignId('assigned_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['active', 'removed'])->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('removed_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id']);
            $table->index(['organizer_id', 'event_id', 'status']);
            $table->index(['user_id', 'status']);
            $table->index(['event_id', 'role', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_staffs');
    }
};
