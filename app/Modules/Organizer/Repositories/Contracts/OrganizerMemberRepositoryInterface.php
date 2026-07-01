<?php

namespace App\Modules\Organizer\Repositories\Contracts;

use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Support\Collection;

interface OrganizerMemberRepositoryInterface
{
    public function findById(int $id): ?OrganizerMember;

    public function findForOrganizer(int $organizerId, int $memberId): ?OrganizerMember;

    public function findActiveMembership(int $userId, int $organizerId): ?OrganizerMember;

    public function membershipExists(int $userId, int $organizerId): bool;

    public function create(array $attributes): OrganizerMember;

    public function update(OrganizerMember $member, array $attributes): OrganizerMember;

    public function delete(OrganizerMember $member): void;

    /**
     * @return Collection<int, OrganizerMember>
     */
    public function listForOrganizer(int $organizerId): Collection;
}
