<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventSchedule extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'title',
        'description',
        'start_at',
        'end_at',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class, 'schedule_id');
    }
}
