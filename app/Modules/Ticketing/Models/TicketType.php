<?php

namespace App\Modules\Ticketing\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Participant\Models\Registration;
use App\Modules\Participant\Models\Ticket;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketType extends Model
{
    use HasOrganizer;
    use SoftDeletes;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'name',
        'description',
        'price',
        'currency',
        'quantity',
        'sold_count',
        'reserved_count',
        'min_per_order',
        'max_per_order',
        'package_type',
        'min_registrations_per_unit',
        'max_registrations_per_unit',
        'package_config',
        'registration_mode',
        'min_registrations_to_complete',
        'sales_start_at',
        'sales_end_at',
        'visibility',
        'sort_order',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'package_config' => 'array',
            'sales_start_at' => 'datetime',
            'sales_end_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function waitlists(): HasMany
    {
        return $this->hasMany(Waitlist::class);
    }
}
