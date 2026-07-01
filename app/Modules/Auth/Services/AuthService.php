<?php

namespace App\Modules\Auth\Services;

use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Contracts\PersonalAccessTokenServiceInterface;
use App\Modules\Auth\Contracts\UserRoleResolverInterface;
use App\Modules\Auth\DTOs\AuthenticatedUserDto;
use App\Modules\Auth\DTOs\LoginDto;
use App\Modules\Auth\Enums\UserRole;
use App\Modules\Auth\Exceptions\AccountSuspendedException;
use App\Modules\Auth\Exceptions\EmailNotVerifiedException;
use App\Modules\Auth\Exceptions\InvalidCredentialsException;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Contracts\Auth\Factory as AuthFactory;
use Illuminate\Contracts\Auth\StatefulGuard;

class AuthService implements AuthServiceInterface
{
    /** @var UserRepositoryInterface */
    private $users;

    /** @var AuthFactory */
    private $auth;

    /** @var UserRoleResolverInterface */
    private $roleResolver;

    /** @var ActiveOrganizerServiceInterface */
    private $activeOrganizerService;

    /** @var OrganizerContextInterface */
    private $organizerContext;

    /** @var PersonalAccessTokenServiceInterface */
    private $tokenService;

    public function __construct(
        UserRepositoryInterface $users,
        AuthFactory $auth,
        UserRoleResolverInterface $roleResolver,
        ActiveOrganizerServiceInterface $activeOrganizerService,
        OrganizerContextInterface $organizerContext,
        PersonalAccessTokenServiceInterface $tokenService
    ) {
        $this->users = $users;
        $this->auth = $auth;
        $this->roleResolver = $roleResolver;
        $this->activeOrganizerService = $activeOrganizerService;
        $this->organizerContext = $organizerContext;
        $this->tokenService = $tokenService;
    }

    public function login(LoginDto $dto): User
    {
        $user = $this->users->findByEmail($dto->email);

        if ($user === null) {
            throw InvalidCredentialsException::make();
        }

        if ($user->status !== 'active') {
            throw AccountSuspendedException::make();
        }

        if (config('auth_module.require_email_verification', true) && $user->email_verified_at === null) {
            throw EmailNotVerifiedException::make();
        }

        /** @var StatefulGuard $guard */
        $guard = $this->auth->guard('web');

        if (! $guard->attempt(['email' => $dto->email, 'password' => $dto->password], $dto->remember)) {
            throw InvalidCredentialsException::make();
        }

        /** @var User $authenticated */
        $authenticated = $guard->user();

        if (config('auth_module.session.regenerate_on_login', true)) {
            request()->session()->regenerate();
        }

        $authenticated->forceFill(['last_login_at' => now()])->save();

        $this->activeOrganizerService->getActiveOrganizerId($authenticated);

        return $authenticated;
    }

    public function logout(User $user): void
    {
        $this->tokenService->revokeCurrentToken($user);

        /** @var StatefulGuard $guard */
        $guard = $this->auth->guard('web');
        $guard->logout();

        request()->session()->invalidate();
        request()->session()->regenerateToken();

        $this->activeOrganizerService->clear($user);
        $this->organizerContext->clear();
    }

    public function currentUser(User $user): AuthenticatedUserDto
    {
        $activeOrganizerId = $this->organizerContext->getOrganizerId()
            ?? $this->activeOrganizerService->getActiveOrganizerId($user);

        $roles = $this->roleResolver->resolveRoles($user, $activeOrganizerId);

        $activeOrganizer = null;
        $activeMembership = null;

        if ($activeOrganizerId !== null) {
            $organizer = $this->organizerContext->organizer();

            if ($organizer === null) {
                $organizer = $this->activeOrganizerService->getAvailableOrganizers($user)
                    ->firstWhere('id', $activeOrganizerId);
            }

            if ($organizer !== null) {
                $activeOrganizer = [
                    'id' => $organizer->id,
                    'uuid' => $organizer->uuid,
                    'name' => $organizer->name,
                    'slug' => $organizer->slug,
                    'logo_url' => $organizer->logo_url,
                ];
            }

            $membership = $this->organizerContext->membership();

            if ($membership === null) {
                $membership = OrganizerMember::query()
                    ->where('user_id', $user->id)
                    ->where('organizer_id', $activeOrganizerId)
                    ->where('status', 'active')
                    ->first();
            }

            if ($membership !== null) {
                $activeMembership = [
                    'id' => $membership->id,
                    'role' => $membership->role,
                    'resolved_role' => $this->mapMembershipRole($membership->role),
                ];
            }
        }

        return new AuthenticatedUserDto(
            $user->id,
            $user->uuid,
            $user->name,
            $user->email,
            $user->phone,
            $user->avatar_url,
            $user->email_verified_at !== null,
            $roles,
            $activeOrganizer,
            $activeMembership,
            $this->roleResolver->resolvePrimaryRole($user, $activeOrganizerId)
        );
    }

    private function mapMembershipRole(string $role): string
    {
        switch ($role) {
            case 'owner':
            case 'admin':
                return UserRole::ORGANIZER;
            case 'staff':
            case 'scanner':
                return UserRole::STAFF;
            default:
                return UserRole::PARTICIPANT;
        }
    }
}
