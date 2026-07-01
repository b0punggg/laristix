<?php

namespace App\Modules\Payment\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentLog extends Model implements TenantAware
{
    use HasOrganizer;

    public $timestamps = false;

    protected $fillable = [
        'payment_id',
        'order_id',
        'organizer_id',
        'gateway',
        'event_type',
        'gateway_event_id',
        'payload',
        'response_status',
        'ip_address',
        'processed',
        'processed_at',
        'error_message',
        'created_at',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed' => 'boolean',
        'processed_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
