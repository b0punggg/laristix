<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Auth\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model implements TenantAware
{
    use HasOrganizer;
    use HasUuid;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'organizer_id',
        'venue_id',
        'category_id',
        'created_by',
        'title',
        'slug',
        'description',
        'short_description',
        'banner_url',
        'status',
        'visibility',
        'start_at',
        'end_at',
        'timezone',
        'capacity',
        'is_free',
        'settings',
        'published_at',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'published_at' => 'datetime',
        'is_free' => 'boolean',
        'settings' => 'array',
    ];

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(EventCategory::class, 'event_category_event', 'event_id', 'category_id');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(EventTag::class, 'event_tag', 'event_id', 'tag_id');
    }

    public function registrationForm(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(\App\Modules\Order\Models\RegistrationForm::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(EventSchedule::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(EventMedia::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    public function staffs(): HasMany
    {
        return $this->hasMany(EventStaff::class);
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(\App\Modules\Ticketing\Models\TicketType::class);
    }

    public function isPublished(): bool
    {
        return in_array($this->status, ['published', 'live', 'completed'], true);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function canEdit(): bool
    {
        return in_array($this->status, ['draft', 'published'], true);
    }

    public function canPublish(): bool
    {
        return $this->status === 'draft';
    }

    public function canRevertToDraft(): bool
    {
        return $this->status === 'published';
    }

    public function canDelete(): bool
    {
        return in_array($this->status, ['draft', 'published'], true);
    }
}
