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
            $table->foreignId('organizer_id')->nullable()->constrained()->nullOnDelete();
            $table->string('recipient_email');
            $table->enum('channel', ['email', 'whatsapp', 'sms'])->default('email');
            $table->string('template', 50);
            $table->nullableMorphs('notifiable');
            $table->enum('status', ['queued', 'sent', 'failed', 'bounced'])->default('queued');
            $table->json('payload')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['notifiable_type', 'notifiable_id']);
            $table->index(['recipient_email', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index('organizer_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_logs');
    }
};
