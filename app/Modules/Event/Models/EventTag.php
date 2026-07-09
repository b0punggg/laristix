<?php

namespace App\Modules\Event\Models;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class EventTag extends Model
{
    protected $table = 'event_tags';

    protected $fillable = [
        'organizer_id',
        'name',
        'slug',
        'sort_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_tag', 'tag_id', 'event_id');
    }

    public function isGlobal(): bool
    {
        return $this->organizer_id === null;
    }
}
