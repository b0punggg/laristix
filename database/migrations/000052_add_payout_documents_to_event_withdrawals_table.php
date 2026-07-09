<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('event_withdrawals', function (Blueprint $table) {
            $table->string('invoice_number', 100)->nullable()->after('account_number');
            $table->string('invoice_url')->nullable()->after('invoice_number');
            $table->string('supporting_document_url')->nullable()->after('invoice_url');
            $table->string('transfer_proof_url')->nullable()->after('supporting_document_url');
            $table->json('status_history')->nullable()->after('transfer_proof_url');
        });
    }

    public function down(): void
    {
        Schema::table('event_withdrawals', function (Blueprint $table) {
            $table->dropColumn([
                'invoice_number',
                'invoice_url',
                'supporting_document_url',
                'transfer_proof_url',
                'status_history',
            ]);
        });
    }
};
