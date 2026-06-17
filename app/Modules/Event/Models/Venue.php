<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venue extends Model
{
    use HasOrganizer;
    use SoftDeletes;

    protected $fillable = [
        'organizer_id',
        'name',
        'type',
        'address',
        'city',
        'province',
        'country_code',
        'postal_code',
        'latitude',
        'longitude',
        'online_url',
        'capacity',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'decimal:8',
            'longitude' => 'decimal:8',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }
}
