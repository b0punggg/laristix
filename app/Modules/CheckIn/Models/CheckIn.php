<?php

namespace App\Modules\CheckIn\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Participant\Models\Registration;
use App\Modules\Participant\Models\Ticket;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CheckIn extends Model
{
    use HasOrganizer;

    public $timestamps = false;

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
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'checked_in_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

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

    public function scannedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'scanned_by');
    }
}
