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
            $table->foreignId('organizer_id')->nullable()->constrained()->cascadeOnDelete();
            $table->foreignId('event_id')->nullable()->constrained()->cascadeOnDelete();
            $table->enum('channel', ['email', 'whatsapp', 'sms'])->default('email');
            $table->string('slug', 100);
            $table->string('name');
            $table->string('subject')->nullable();
            $table->longText('body');
            $table->json('variables')->nullable()->comment('Available template variables schema');
            $table->json('metadata')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['organizer_id', 'event_id', 'channel', 'slug'], 'notification_templates_scope_slug_unique');
            $table->index(['channel', 'is_active']);
            $table->index(['organizer_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_templates');
    }
};
