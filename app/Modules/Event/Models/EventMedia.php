<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventMedia extends Model
{
    use HasOrganizer;

    protected $table = 'event_media';

    protected $fillable = [
        'event_id',
        'organizer_id',
        'type',
        'url',
        'alt_text',
        'sort_order',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
