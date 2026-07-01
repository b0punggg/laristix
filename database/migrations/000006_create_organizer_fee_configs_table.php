<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizer_fee_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('organizer_id')->constrained('organizers', 'id', 'fk_org_fee_org')->cascadeOnDelete();
            $table->enum('fee_type', ['percentage', 'flat', 'both']);
            $table->decimal('percentage_rate', 5, 2)->default(0);
            $table->decimal('flat_amount', 15, 2)->default(0);
            $table->enum('fee_bearer', ['attendee', 'organizer'])->default('attendee');
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->foreignId('created_by')->constrained('users', 'id', 'fk_org_fee_users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['organizer_id', 'effective_from', 'effective_until'], 'idx_org_fee_period');
            $table->index(['organizer_id', 'effective_until'], 'idx_org_fee_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizer_fee_configs');
    }
};
