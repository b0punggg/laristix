<?php

namespace App\Modules\Payment\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Auth\Models\User;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Refund extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'payment_id',
        'order_id',
        'organizer_id',
        'gateway_refund_id',
        'amount',
        'reason',
        'status',
        'initiated_by',
        'gateway_response',
        'refunded_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'gateway_response' => 'array',
            'refunded_at' => 'datetime',
        ];
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function initiatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'initiated_by');
    }
}
