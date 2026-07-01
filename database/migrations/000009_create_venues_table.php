<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('venues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_venues_org')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['physical', 'online', 'hybrid'])->default('physical');
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->char('country_code', 2)->nullable();
            $table->string('postal_code', 20)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('online_url', 500)->nullable();
            $table->unsignedInteger('capacity')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('organizer_id', 'idx_venues_org');
            $table->index(['organizer_id', 'name'], 'idx_venues_org_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('venues');
    }
};
