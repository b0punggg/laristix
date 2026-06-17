<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizers', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('slug', 100)->unique();
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->string('website', 500)->nullable();
            $table->text('description')->nullable();
            $table->char('country_code', 2)->default('ID');
            $table->char('currency', 3)->default('IDR');
            $table->string('timezone', 50)->default('Asia/Jakarta');
            $table->json('settings')->nullable();
            $table->enum('status', ['pending', 'active', 'suspended', 'archived'])->default('pending');
            $table->string('db_connection', 50)->nullable()->comment('Future dedicated DB connection name');
            $table->enum('migration_status', ['shared', 'pending', 'migrating', 'dedicated'])->default('shared');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('migration_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizers');
    }
};
