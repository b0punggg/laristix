<?php

namespace App\Modules\Order\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Event\Models\Event;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Registration extends Model implements TenantAware
{
    use HasOrganizer;
    use HasUuid;

    protected $fillable = [
        'organizer_id',
        'event_id',
        'order_id',
        'order_item_id',
        'ticket_type_id',
        'seat_index',
        'attendee_name',
        'attendee_email',
        'attendee_phone',
        'metadata',
        'status',
        'confirmed_at',
        'cancelled_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'seat_index' => 'integer',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }

    public function ticket(): HasOne
    {
        return $this->hasOne(Ticket::class);
    }
}
