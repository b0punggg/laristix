<?php

namespace App\Modules\Order\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Event\Models\Event;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model implements TenantAware
{
    use HasOrganizer;
    use HasUuid;

    protected $fillable = [
        'registration_id',
        'organizer_id',
        'event_id',
        'ticket_type_id',
        'ticket_code',
        'qr_token',
        'qr_token_hash',
        'status',
        'issued_at',
        'used_at',
        'cancelled_at',
        'pdf_url',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
        'used_at' => 'datetime',
        'cancelled_at' => 'datetime',
    ];

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }
}
