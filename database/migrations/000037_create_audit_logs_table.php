<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_audit_logs_org')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users', 'id', 'fk_audit_logs_users')->nullOnDelete();
            $table->enum('category', ['auth', 'financial', 'admin', 'security', 'system']);
            $table->string('event', 100);
            $table->string('auditable_type')->nullable();
            $table->unsignedBigInteger('auditable_id')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->uuid('request_id')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['organizer_id', 'category', 'created_at'], 'idx_audit_logs_org_cat');
            $table->index(['auditable_type', 'auditable_id'], 'idx_audit_logs_auditable');
            $table->index(['event', 'created_at'], 'idx_audit_logs_event');
            $table->index('request_id', 'idx_audit_logs_request');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
