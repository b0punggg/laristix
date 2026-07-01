<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_notif_logs_org')->nullOnDelete();
            $table->string('recipient_email');
            $table->enum('channel', ['email', 'whatsapp', 'sms'])->default('email');
            $table->string('template', 50);
            $table->nullableMorphs('notifiable', 'idx_notif_logs_notifiable');
            $table->enum('status', ['queued', 'sent', 'failed', 'bounced'])->default('queued');
            $table->json('payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['recipient_email', 'created_at'], 'idx_notif_logs_recipient');
            $table->index(['status', 'created_at'], 'idx_notif_logs_stat');
            $table->index('organizer_id', 'idx_notif_logs_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
