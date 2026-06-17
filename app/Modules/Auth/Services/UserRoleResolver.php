<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\UserRoleResolverInterface;
use App\Modules\Auth\Enums\UserRole;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\OrganizerMember;

class UserRoleResolver implements UserRoleResolverInterface
{
    public function resolveRoles(User $user, ?int $activeOrganizerId = null): array
    {
        $roles = [];

        if ($user->isSuperAdmin()) {
            $roles[] = UserRole::SuperAdmin->value;
        }

        if ($activeOrganizerId !== null) {
            $membership = OrganizerMember::query()
                ->where('user_id', $user->id)
                ->where('organizer_id', $activeOrganizerId)
                ->where('status', 'active')
                ->first();

            if ($membership !== null) {
                $roles[] = $this->mapMembershipRole($membership->role);
            }
        } else {
            $membershipRoles = OrganizerMember::query()
                ->where('user_id', $user->id)
                ->where('status', 'active')
                ->pluck('role')
                ->unique()
                ->all();

            foreach ($membershipRoles as $role) {
                $roles[] = $this->mapMembershipRole($role);
            }
        }

        if ($roles === [] || ! $user->isSuperAdmin()) {
            $roles[] = UserRole::Participant->value;
        }

        return array_values(array_unique($roles));
    }

    public function resolvePrimaryRole(User $user, ?int $activeOrganizerId = null): string
    {
        $roles = $this->resolveRoles($user, $activeOrganizerId);

        $priority = [
            UserRole::SuperAdmin->value,
            UserRole::OrganizerOwner->value,
            UserRole::OrganizerAdmin->value,
            UserRole::OrganizerStaff->value,
            UserRole::EventScanner->value,
            UserRole::Participant->value,
        ];

        foreach ($priority as $role) {
            if (in_array($role, $roles, true)) {
                return $role;
            }
        }

        return UserRole::Participant->value;
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
