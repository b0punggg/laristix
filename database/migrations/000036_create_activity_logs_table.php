<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_act_logs_org')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users', 'id', 'fk_act_logs_users')->nullOnDelete();
            $table->string('action', 50);
            $table->string('subject_type');
            $table->unsignedBigInteger('subject_id');
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['organizer_id', 'created_at'], 'idx_act_logs_org');
            $table->index(['subject_type', 'subject_id'], 'idx_act_logs_subject');
            $table->index(['user_id', 'created_at'], 'idx_act_logs_user');
            $table->index(['action', 'created_at'], 'idx_act_logs_action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
