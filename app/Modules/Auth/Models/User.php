<?php

namespace App\Modules\Auth\Models;

use App\Core\Support\Traits\HasUuid;
use App\Modules\Auth\Notifications\VerifyEmailNotification;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Event\Models\EventStaff;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Order\Models\Order;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasApiTokens;
    use HasFactory;
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

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function organizerMembers(): HasMany
    {
        return $this->hasMany(OrganizerMember::class);
    }

    public function activeOrganizerMembers(): HasMany
    {
        return $this->organizerMembers()->where('status', 'active');
    }

    public function eventStaffs(): HasMany
    {
        return $this->hasMany(EventStaff::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function checkIns(): HasMany
    {
        return $this->hasMany(CheckIn::class, 'scanned_by');
    }

    public function isSuperAdmin(): bool
    {
        return $this->platform_role === 'super_admin';
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
