<?php

namespace App\Modules\Auth\Services;

use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Contracts\UserRoleResolverInterface;
use App\Modules\Auth\DTOs\AuthenticatedUserDto;
use App\Modules\Auth\Enums\UserRole;
use App\Modules\Auth\Exceptions\AccountSuspendedException;
use App\Modules\Auth\Exceptions\EmailNotVerifiedException;
use App\Modules\Auth\Exceptions\InvalidCredentialsException;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Contracts\PersonalAccessTokenServiceInterface;
use App\Modules\Auth\DTOs\LoginDto;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Auth\AuthManager;
use Illuminate\Contracts\Auth\StatefulGuard;

class AuthService implements AuthServiceInterface
{
    public function __construct(
        private readonly UserRepositoryInterface $users,
        private readonly AuthManager $auth,
        private readonly UserRoleResolverInterface $roleResolver,
        private readonly ActiveOrganizerServiceInterface $activeOrganizerService,
        private readonly OrganizerContextInterface $organizerContext,
        private readonly PersonalAccessTokenServiceInterface $tokenService,
    ) {}

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
            $organizer = $this->organizerContext->organizer()
                ?? $this->activeOrganizerService->getAvailableOrganizers($user)
                    ->firstWhere('id', $activeOrganizerId);

            if ($organizer !== null) {
                $activeOrganizer = [
                    'id' => $organizer->id,
                    'uuid' => $organizer->uuid,
                    'name' => $organizer->name,
                    'slug' => $organizer->slug,
                    'logo_url' => $organizer->logo_url,
                ];
            }

            $membership = $this->organizerContext->membership()
                ?? OrganizerMember::query()
                    ->where('user_id', $user->id)
                    ->where('organizer_id', $activeOrganizerId)
                    ->where('status', 'active')
                    ->first();

            if ($membership !== null) {
                $activeMembership = [
                    'id' => $membership->id,
                    'role' => $membership->role,
                    'resolved_role' => $this->mapMembershipRole($membership->role),
                ];
            }
        }

        return new AuthenticatedUserDto(
            id: $user->id,
            uuid: $user->uuid,
            name: $user->name,
            email: $user->email,
            phone: $user->phone,
            avatarUrl: $user->avatar_url,
            emailVerified: $user->email_verified_at !== null,
            roles: $roles,
            activeOrganizer: $activeOrganizer,
            activeMembership: $activeMembership,
            primaryRole: $this->roleResolver->resolvePrimaryRole($user, $activeOrganizerId),
        );
    }

    private function mapMembershipRole(string $role): string
    {
        return match ($role) {
            'owner' => UserRole::OrganizerOwner->value,
            'admin' => UserRole::OrganizerAdmin->value,
            'staff' => UserRole::OrganizerStaff->value,
            'scanner' => UserRole::EventScanner->value,
            default => UserRole::Participant->value,
        };
    }
}
