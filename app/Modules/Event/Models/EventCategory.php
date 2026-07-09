<?php

namespace App\Modules\Event\Models;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EventCategory extends Model
{
    protected $table = 'event_categories';

    protected $fillable = [
        'organizer_id',
        'name',
        'slug',
        'icon',
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

    public function events(): HasMany
    {
        return $this->hasMany(Event::class, 'category_id');
    }

    public function categorizedEvents(): BelongsToMany
    {
        return $this->belongsToMany(Event::class, 'event_category_event', 'category_id', 'event_id');
    }

    public function isGlobal(): bool
    {
        return $this->organizer_id === null;
    }
}
