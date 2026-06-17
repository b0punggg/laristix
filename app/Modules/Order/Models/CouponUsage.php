<?php

namespace App\Modules\Order\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Auth\Models\User;
use App\Modules\Ticketing\Models\Coupon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CouponUsage extends Model
{
    use HasOrganizer;

    public $timestamps = false;

    protected $fillable = [
        'coupon_id',
        'order_id',
        'organizer_id',
        'user_id',
        'discount_applied',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'discount_applied' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
