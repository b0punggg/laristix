<?php

namespace App\Modules\Participant\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Registration extends Model
{
    use HasOrganizer;
    use HasUuid;

    protected $fillable = [
        'uuid',
        'organizer_id',
        'event_id',
        'order_id',
        'order_item_id',
        'registration_group_id',
        'ticket_type_id',
        'seat_index',
        'slot_key',
        'attendee_name',
        'attendee_email',
        'attendee_phone',
        'status',
        'confirmed_at',
        'cancelled_at',
    ];

    protected function casts(): array
    {
        return [
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

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

    public function registrationGroup(): BelongsTo
    {
        return $this->belongsTo(RegistrationGroup::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(RegistrationAnswer::class);
    }

    public function ticket(): HasOne
    {
        return $this->hasOne(Ticket::class);
    }
}
