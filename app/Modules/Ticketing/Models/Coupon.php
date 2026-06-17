<?php

namespace App\Modules\Ticketing\Models;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\CouponUsage;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Coupon extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'code',
        'name',
        'scope',
        'organizer_id',
        'event_id',
        'discount_type',
        'discount_value',
        'max_discount_amount',
        'usage_limit',
        'usage_count',
        'per_user_limit',
        'min_order_amount',
        'valid_from',
        'valid_until',
        'is_active',
        'created_by',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'decimal:2',
            'max_discount_amount' => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'valid_from' => 'datetime',
            'valid_until' => 'datetime',
            'is_active' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }
}
