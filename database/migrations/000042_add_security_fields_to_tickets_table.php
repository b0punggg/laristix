<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->string('qr_token', 128)->nullable()->after('ticket_code');
            $table->timestamp('checked_in_at')->nullable()->after('used_at');

            $table->unique('qr_token');
            $table->index('checked_in_at');
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table) {
            $table->dropIndex(['checked_in_at']);
            $table->dropUnique(['qr_token']);
            $table->dropColumn(['qr_token', 'checked_in_at']);
        });
    }
};
