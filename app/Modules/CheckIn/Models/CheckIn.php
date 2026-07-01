<?php

namespace App\Modules\CheckIn\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Models\Ticket;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model implements TenantAware
{
    use HasOrganizer;

    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected $fillable = [
        'ticket_id',
        'registration_id',
        'event_id',
        'organizer_id',
        'gate_id',
        'scanned_by',
        'method',
        'device_info',
        'checked_in_at',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
        'created_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function gate(): BelongsTo
    {
        return $this->belongsTo(CheckInGate::class, 'gate_id');
    }

    public function scanner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }
}
