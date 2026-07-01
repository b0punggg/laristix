<?php

namespace App\Modules\CheckIn\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Event\Models\Event;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CheckInGate extends Model implements TenantAware
{
    use HasOrganizer;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'name',
        'code',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class, 'gate_id');
    }
}
