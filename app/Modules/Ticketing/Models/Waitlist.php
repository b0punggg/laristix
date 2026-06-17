<?php

namespace App\Modules\Ticketing\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Models\EventSession;
use App\Modules\Order\Models\Order;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Waitlist extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'organizer_id',
        'event_id',
        'ticket_type_id',
        'session_id',
        'user_id',
        'email',
        'name',
        'phone',
        'quantity',
        'status',
        'priority',
        'notified_at',
        'converted_order_id',
        'expires_at',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
            'expires_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(EventSession::class, 'session_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function convertedOrder(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'converted_order_id');
    }
}
