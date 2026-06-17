<?php

namespace App\Modules\Organizer\Models;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\EventStaff;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrganizerMember extends Model
{
    /**
     * Intentionally does NOT use HasOrganizer — membership queries must work
     * across all organizers for the authenticated user during context resolution.
     */
    protected $fillable = [
        'organizer_id',
        'user_id',
        'role',
        'invited_by',
        'invited_at',
        'accepted_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'invited_at' => 'datetime',
            'accepted_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function invitedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function eventStaffs(): HasMany
    {
        return $this->hasMany(EventStaff::class);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
