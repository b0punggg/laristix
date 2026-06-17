<?php

namespace App\Modules\Order\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Participant\Models\Registration;
use App\Modules\Participant\Models\RegistrationGroup;
use App\Modules\Payment\Models\Payment;
use App\Modules\Referral\Models\Referral;
use App\Modules\Referral\Models\ReferralCode;
use App\Modules\Ticketing\Models\Coupon;
use App\Modules\Ticketing\Models\PromoCode;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
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
        'promo_code_id',
        'promo_code_snapshot',
        'coupon_id',
        'coupon_snapshot',
        'referral_code_id',
        'idempotency_key',
        'expires_at',
        'paid_at',
        'completed_at',
        'cancelled_at',
        'ip_address',
        'user_agent',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
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
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function promoCode(): BelongsTo
    {
        return $this->belongsTo(PromoCode::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function referralCode(): BelongsTo
    {
        return $this->belongsTo(ReferralCode::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function registrationGroups(): HasMany
    {
        return $this->hasMany(RegistrationGroup::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function promoCodeUsage(): HasOne
    {
        return $this->hasOne(PromoCodeUsage::class);
    }

    public function couponUsage(): HasOne
    {
        return $this->hasOne(CouponUsage::class);
    }

    public function referral(): HasOne
    {
        return $this->hasOne(Referral::class);
    }
}
