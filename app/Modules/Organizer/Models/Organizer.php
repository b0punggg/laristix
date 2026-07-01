<?php

namespace App\Modules\Organizer\Models;

use App\Core\Support\Traits\HasUuid;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    protected $casts = [
        'settings' => 'array',
        'approved_at' => 'datetime',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(OrganizerMember::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(\App\Modules\Event\Models\Event::class);
    }

    public function activeMembers(): HasMany
    {
        return $this->members()->where('status', 'active');
    }

    public function feeConfigs(): HasMany
    {
        return $this->hasMany(OrganizerFeeConfig::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'organizer_members')
            ->withPivot(['role', 'status', 'invited_by', 'invited_at', 'accepted_at'])
            ->withTimestamps();
    }

    public function activeUsers(): BelongsToMany
    {
        return $this->users()->wherePivot('status', 'active');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }
}
