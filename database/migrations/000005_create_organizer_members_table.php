<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizer_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_org_mem_org')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users', 'id', 'fk_org_mem_users')->cascadeOnDelete();
            $table->enum('role', ['owner', 'admin', 'staff', 'scanner']);
            $table->foreignId('invited_by')->nullable()->constrained('users', 'id', 'fk_org_mem_inviter')->nullOnDelete();
            $table->timestamp('invited_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->enum('status', ['pending', 'active', 'removed'])->default('pending');
            $table->timestamps();

            $table->unique(['organizer_id', 'user_id'], 'uniq_org_mem_pair');
            $table->index('user_id', 'idx_org_mem_user');
            $table->index(['organizer_id', 'role'], 'idx_org_mem_role');
            $table->index(['user_id', 'status'], 'idx_org_mem_user_stat');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizer_members');
    }
};
