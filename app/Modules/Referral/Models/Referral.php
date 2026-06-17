<?php

namespace App\Modules\Referral\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Order;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'referral_code_id',
        'organizer_id',
        'event_id',
        'order_id',
        'referred_user_id',
        'referred_email',
        'status',
        'order_amount',
        'commission_amount',
        'commission_status',
        'converted_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'order_amount' => 'decimal:2',
            'commission_amount' => 'decimal:2',
            'converted_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function referralCode(): BelongsTo
    {
        return $this->belongsTo(ReferralCode::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function referredUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'referred_user_id');
    }
}
