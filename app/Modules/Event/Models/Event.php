<?php

namespace App\Modules\Event\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Support\Traits\HasUuid;
use App\Modules\Analytics\Models\DailyEventStats;
use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckInGate;
use App\Modules\Form\Models\RegistrationForm;
use App\Modules\Order\Models\Order;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Participant\Models\Registration;
use App\Modules\Participant\Models\Ticket;
use App\Modules\Referral\Models\Referral;
use App\Modules\Referral\Models\ReferralCode;
use App\Modules\Ticketing\Models\PromoCode;
use App\Modules\Ticketing\Models\TicketType;
use App\Modules\Ticketing\Models\Waitlist;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
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

    protected function casts(): array
    {
        return [
            'start_at' => 'datetime',
            'end_at' => 'datetime',
            'published_at' => 'datetime',
            'is_free' => 'boolean',
            'settings' => 'array',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(EventCategory::class, 'category_id');
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(EventSchedule::class);
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(EventSession::class);
    }

    public function media(): HasMany
    {
        return $this->hasMany(EventMedia::class);
    }

    public function registrationForm(): HasOne
    {
        return $this->hasOne(RegistrationForm::class);
    }

    public function ticketTypes(): HasMany
    {
        return $this->hasMany(TicketType::class);
    }

    public function promoCodes(): HasMany
    {
        return $this->hasMany(PromoCode::class);
    }

    public function referralCodes(): HasMany
    {
        return $this->hasMany(ReferralCode::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }

    public function checkInGates(): HasMany
    {
        return $this->hasMany(CheckInGate::class);
    }

    public function staffs(): HasMany
    {
        return $this->hasMany(EventStaff::class);
    }

    public function waitlists(): HasMany
    {
        return $this->hasMany(Waitlist::class);
    }

    public function referrals(): HasMany
    {
        return $this->hasMany(Referral::class);
    }

    public function dailyStats(): HasMany
    {
        return $this->hasMany(DailyEventStats::class);
    }
}
