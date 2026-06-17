<?php

namespace App\Modules\Participant\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrationGroup extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'organizer_id',
        'event_id',
        'order_id',
        'order_item_id',
        'name',
        'company_name',
        'contact_name',
        'contact_email',
        'contact_phone',
        'expected_count',
        'completed_count',
        'status',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }
}
