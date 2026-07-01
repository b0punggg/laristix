<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventStaff extends Model
{
    use HasOrganizer;

    protected $table = 'event_staffs';

    protected $fillable = [
        'event_id',
        'organizer_id',
        'user_id',
        'organizer_member_id',
        'role',
        'permissions',
        'assigned_by',
        'status',
        'assigned_at',
        'removed_at',
    ];

    protected $casts = [
        'permissions' => 'array',
        'assigned_at' => 'datetime',
        'removed_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function organizerMember(): BelongsTo
    {
        return $this->belongsTo(OrganizerMember::class);
    }

    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_by');
    }
}
