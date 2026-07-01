<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notification_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->nullable()->constrained('organizers', 'id', 'fk_notif_tpl_org')->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained('events', 'id', 'fk_notif_tpl_events')->cascadeOnDelete();
            $table->enum('channel', ['email', 'whatsapp', 'sms'])->default('email');
            $table->string('slug', 100);
            $table->string('name');
            $table->string('subject')->nullable();
            $table->longText('body');
            $table->json('variables')->nullable()->comment('Available template variables schema');
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users', 'id', 'fk_notif_tpl_users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organizer_id', 'event_id', 'channel', 'slug'], 'uniq_notif_tpl_scope');
            $table->index(['channel', 'is_active'], 'idx_notif_tpl_channel');
            $table->index(['organizer_id', 'is_active'], 'idx_notif_tpl_org');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
