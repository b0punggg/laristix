<?php

namespace App\Modules\Organizer\Repositories\Eloquent;

use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Support\Collection;

class OrganizerMemberRepository implements OrganizerMemberRepositoryInterface
{
    public function findById(int $id): ?OrganizerMember
    {
        return OrganizerMember::query()->find($id);
    }

    public function findForOrganizer(int $organizerId, int $memberId): ?OrganizerMember
    {
        return OrganizerMember::query()
            ->where('organizer_id', $organizerId)
            ->where('id', $memberId)
            ->first();
    }

    public function findActiveMembership(int $userId, int $organizerId): ?OrganizerMember
    {
        return OrganizerMember::query()
            ->where('user_id', $userId)
            ->where('organizer_id', $organizerId)
            ->where('status', 'active')
            ->first();
    }

    public function membershipExists(int $userId, int $organizerId): bool
    {
        return OrganizerMember::query()
            ->where('user_id', $userId)
            ->where('organizer_id', $organizerId)
            ->whereIn('status', ['pending', 'active'])
            ->exists();
    }

    public function create(array $attributes): OrganizerMember
    {
        return OrganizerMember::query()->create($attributes);
    }

    public function update(OrganizerMember $member, array $attributes): OrganizerMember
    {
        $member->fill($attributes);
        $member->save();

        return $member->fresh();
    }

    public function delete(OrganizerMember $member): void
    {
        $member->delete();
    }

    public function listForOrganizer(int $organizerId): Collection
    {
        return OrganizerMember::query()
            ->with(['user', 'invitedBy'])
            ->where('organizer_id', $organizerId)
            ->whereIn('status', ['pending', 'active'])
            ->orderByRaw("FIELD(role, 'owner', 'admin', 'staff', 'scanner')")
            ->orderBy('created_at')
            ->get();
    }
}
