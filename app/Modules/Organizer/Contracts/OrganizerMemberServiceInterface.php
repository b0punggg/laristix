<?php

namespace App\Modules\Organizer\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\DTOs\InviteOrganizerMemberDto;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Support\Collection;

interface OrganizerMemberServiceInterface
{
    /**
     * @return Collection<int, OrganizerMember>
     */
    public function list(Organizer $organizer, User $user): Collection;

    public function invite(Organizer $organizer, User $inviter, InviteOrganizerMemberDto $dto): OrganizerMember;

    public function update(
        Organizer $organizer,
        User $actor,
        OrganizerMember $member,
        ?string $role = null,
        ?string $status = null
    ): OrganizerMember;

    public function remove(Organizer $organizer, User $actor, OrganizerMember $member): void;

    /**
     * @return Collection<int, OrganizerMember>
     */
    public function listPendingInvitations(User $user): Collection;

    public function acceptInvitation(User $user, int $memberId): OrganizerMember;

    public function declineInvitation(User $user, int $memberId): void;
}
