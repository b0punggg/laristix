<?php

namespace App\Modules\Order\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Payment\Models\Payment;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model implements TenantAware
{
    use HasOrganizer;
    use HasUuid;

    protected $fillable = [
        'uuid',
        'order_number',
        'organizer_id',
        'event_id',
        'user_id',
        'buyer_name',
        'buyer_email',
        'buyer_phone',
        'status',
        'currency',
        'subtotal',
        'discount_amount',
        'platform_fee_pct_rate',
        'platform_fee_flat',
        'platform_fee_total',
        'fee_bearer',
        'total_amount',
        'organizer_net_amount',
        'idempotency_key',
        'expires_at',
        'paid_at',
        'completed_at',
        'cancelled_at',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount_amount' => 'decimal:2',
        'platform_fee_pct_rate' => 'decimal:2',
        'platform_fee_flat' => 'decimal:2',
        'platform_fee_total' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'organizer_net_amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function isAwaitingPayment(): bool
    {
        return $this->status === OrderStatus::AWAITING_PAYMENT;
    }

    public function isCompleted(): bool
    {
        return $this->status === OrderStatus::COMPLETED;
    }

    public function isPaid(): bool
    {
        return in_array($this->status, [OrderStatus::PAID, OrderStatus::COMPLETED], true);
    }

    public function requiresPayment(): bool
    {
        return (float) $this->total_amount > 0;
    }
}
