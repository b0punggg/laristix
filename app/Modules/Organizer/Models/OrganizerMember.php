<?php

namespace App\Modules\Organizer\Models;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrganizerMember extends Model
{
    /**
     * Does not use HasOrganizer — membership queries span all organizers.
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

    protected $casts = [
        'invited_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

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

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isOwner(): bool
    {
        return $this->role === OrganizerMemberRole::OWNER;
    }

    public function canManageMembers(): bool
    {
        return in_array($this->role, OrganizerMemberRole::managers(), true);
    }
}
