<?php

namespace App\Modules\Organizer\Models;

use App\Core\Support\Traits\HasUuid;
use App\Modules\Admin\Models\OrganizerFeeConfig;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Models\EventCategory;
use App\Modules\Event\Models\Venue;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Organizer extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'slug',
        'email',
        'phone',
        'logo_url',
        'website',
        'description',
        'country_code',
        'currency',
        'timezone',
        'settings',
        'status',
        'db_connection',
        'migration_status',
        'approved_at',
        'approved_by',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'approved_at' => 'datetime',
        ];
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function members(): HasMany
    {
        return $this->hasMany(OrganizerMember::class);
    }

    public function feeConfigs(): HasMany
    {
        return $this->hasMany(OrganizerFeeConfig::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(Event::class);
    }

    public function venues(): HasMany
    {
        return $this->hasMany(Venue::class);
    }

    public function categories(): HasMany
    {
        return $this->hasMany(EventCategory::class);
    }
}
