<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class EventSession extends Model
{
    use HasOrganizer;
    use SoftDeletes;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'schedule_id',
        'venue_id',
        'title',
        'description',
        'session_type',
        'start_at',
        'end_at',
        'capacity',
        'registered_count',
        'sort_order',
        'is_active',
        'settings',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'is_active' => 'boolean',
        'settings' => 'array',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function schedule(): BelongsTo
    {
        return $this->belongsTo(EventSchedule::class, 'schedule_id');
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}
