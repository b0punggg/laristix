<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_jobs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('organizer_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('notification_template_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('notification_log_id')->nullable()->constrained('notification_logs')->nullOnDelete();
            $table->enum('channel', ['email', 'whatsapp', 'sms'])->default('email');
            $table->string('recipient');
            $table->nullableMorphs('notifiable');
            $table->json('payload')->nullable();
            $table->enum('status', ['pending', 'processing', 'sent', 'failed', 'cancelled'])->default('pending');
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->unsignedTinyInteger('max_attempts')->default(3);
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->json('provider_response')->nullable();
            $table->uuid('correlation_id')->nullable();
            $table->timestamps();

            $table->index(['status', 'scheduled_at']);
            $table->index(['organizer_id', 'status', 'created_at']);
            $table->index(['channel', 'status']);
            $table->index('correlation_id');
            $table->index(['notifiable_type', 'notifiable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_jobs');
    }
};
