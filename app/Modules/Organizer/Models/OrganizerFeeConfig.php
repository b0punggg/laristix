<?php

namespace App\Modules\Organizer\Models;

use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizerFeeConfig extends Model
{
    protected $fillable = [
        'organizer_id',
        'fee_type',
        'percentage_rate',
        'flat_amount',
        'fee_bearer',
        'effective_from',
        'effective_until',
        'created_by',
        'notes',
    ];

    protected $casts = [
        'percentage_rate' => 'decimal:2',
        'flat_amount' => 'decimal:2',
        'effective_from' => 'datetime',
        'effective_until' => 'datetime',
    ];

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
