<?php

namespace App\Modules\Order\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Event\Models\Event;
use App\Modules\Participant\Models\Registration;
use App\Modules\Participant\Models\RegistrationGroup;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrderItem extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'order_id',
        'organizer_id',
        'event_id',
        'ticket_type_id',
        'ticket_type_name',
        'unit_price',
        'quantity',
        'subtotal',
        'package_type_snapshot',
        'min_registrations_per_unit_snapshot',
        'max_registrations_per_unit_snapshot',
        'package_config_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'unit_price' => 'decimal:2',
            'subtotal' => 'decimal:2',
            'package_config_snapshot' => 'array',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function ticketType(): BelongsTo
    {
        return $this->belongsTo(TicketType::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function registrationGroups(): HasMany
    {
        return $this->hasMany(RegistrationGroup::class);
    }
}
