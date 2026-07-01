<?php

namespace App\Modules\Auth\Models;

use App\Core\Support\Traits\HasUuid;
use App\Modules\Auth\Notifications\VerifyEmailNotification;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
    use HasRoles;
    use HasUuid;
    use Notifiable;
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'name',
        'email',
        'password',
        'phone',
        'avatar_url',
        'platform_role',
        'status',
        'last_login_at',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login_at' => 'datetime',
        'password' => 'hashed',
    ];

    protected $guard_name = 'web';

    protected static function newFactory(): UserFactory
    {
        return UserFactory::new();
    }

    // -------------------------------------------------------------------------
    // Organizer membership (cross-module; Organizer module owns business rules)
    // -------------------------------------------------------------------------

    public function organizerMembers(): HasMany
    {
        return $this->hasMany(OrganizerMember::class);
    }

    public function activeOrganizerMembers(): HasMany
    {
        return $this->organizerMembers()->where('status', 'active');
    }

    public function organizers(): BelongsToMany
    {
        return $this->belongsToMany(Organizer::class, 'organizer_members')
            ->withPivot(['role', 'status', 'invited_by', 'invited_at', 'accepted_at'])
            ->withTimestamps();
    }

    public function activeOrganizers(): BelongsToMany
    {
        return $this->organizers()->wherePivot('status', 'active');
    }

    /** Memberships this user invited (organizer_members.invited_by). */
    public function sentOrganizerInvitations(): HasMany
    {
        return $this->hasMany(OrganizerMember::class, 'invited_by');
    }

    // -------------------------------------------------------------------------
    // Sanctum API tokens (personal_access_tokens.tokenable morph)
    // -------------------------------------------------------------------------

    // Provided by HasApiTokens: tokens(), createToken(), currentAccessToken(), etc.

    // -------------------------------------------------------------------------
    // Domain helpers
    // -------------------------------------------------------------------------

    public function isSuperAdmin(): bool
    {
        return $this->platform_role === 'super_admin';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isParticipant(): bool
    {
        return $this->platform_role === 'user'
            && $this->activeOrganizerMembers()->doesntExist();
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerifyEmailNotification);
    }
}
