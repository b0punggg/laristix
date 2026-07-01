<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Tenancy\Contracts\TenantAware;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Venue extends Model implements TenantAware
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

    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }
}
