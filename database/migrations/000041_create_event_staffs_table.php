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
            $table->foreignId('event_id')->constrained('events', 'id', 'fk_evt_staff_events')->cascadeOnDelete();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_evt_staff_org')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users', 'id', 'fk_evt_staff_users')->cascadeOnDelete();
            $table->foreignId('organizer_member_id')->nullable()->constrained('organizer_members', 'id', 'fk_evt_staff_mem')->nullOnDelete();
            $table->enum('role', ['manager', 'coordinator', 'staff', 'scanner'])->default('staff');
            $table->json('permissions')->nullable()->comment('Future granular event permissions');
            $table->foreignId('assigned_by')->nullable()->constrained('users', 'id', 'fk_evt_staff_assigner')->nullOnDelete();
            $table->enum('status', ['active', 'removed'])->default('active');
            $table->timestamp('assigned_at')->useCurrent();
            $table->timestamp('removed_at')->nullable();
            $table->timestamps();

            $table->unique(['event_id', 'user_id'], 'uniq_evt_staff_pair');
            $table->index(['organizer_id', 'event_id', 'status'], 'idx_evt_staff_org_evt');
            $table->index(['user_id', 'status'], 'idx_evt_staff_user');
            $table->index(['event_id', 'role', 'status'], 'idx_evt_staff_role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_staffs');
    }
};
