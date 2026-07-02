<?php

namespace App\Modules\Organizer\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Admin\Contracts\ActivityLogServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerServiceInterface;
use App\Modules\Organizer\DTOs\UpdateOrganizerDto;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrganizerService implements OrganizerServiceInterface
{
    /** @var OrganizerRepositoryInterface */
    private $organizers;

    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    /** @var AuditLogServiceInterface */
    private $auditLogs;

    /** @var ActivityLogServiceInterface */
    private $activityLogs;

    public function __construct(
        OrganizerRepositoryInterface $organizers,
        OrganizerMemberRepositoryInterface $members,
        AuditLogServiceInterface $auditLogs,
        ActivityLogServiceInterface $activityLogs,
    ) {
        $this->organizers = $organizers;
        $this->members = $members;
        $this->auditLogs = $auditLogs;
        $this->activityLogs = $activityLogs;
    }

    public function show(Organizer $organizer, User $user): Organizer
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);

        return $organizer;
    }

    public function update(Organizer $organizer, User $user, UpdateOrganizerDto $dto): Organizer
    {
        $this->assertCanManageOrganizer($organizer, $user);

        return $this->organizers->update($organizer, $dto->toArray());
    }

    public function approve(Organizer $organizer, User $admin): Organizer
    {
        $this->assertSuperAdmin($admin);

        if ($organizer->status !== OrganizerStatus::PENDING) {
            throw OrganizerAccessDeniedException::make('Only pending organizers can be approved.');
        }

        $oldStatus = $organizer->status;

        $updated = $this->organizers->update($organizer, [
            'status' => OrganizerStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $admin->id,
        ]);

        $this->logOrganizerAdminAction($admin, $updated, 'organizer.approved', $oldStatus, OrganizerStatus::ACTIVE);

        return $updated;
    }

    public function listPending(User $admin): Collection
    {
        $this->assertSuperAdmin($admin);

        return $this->organizers->listPending();
    }

    public function listForPlatform(User $admin, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $this->assertSuperAdmin($admin);

        return $this->organizers->paginateForPlatform($filters, $perPage);
    }

    public function showForPlatform(User $admin, Organizer $organizer): Organizer
    {
        $this->assertSuperAdmin($admin);

        return $organizer;
    }

    public function suspend(Organizer $organizer, User $admin): Organizer
    {
        $this->assertSuperAdmin($admin);

        if ($organizer->status !== OrganizerStatus::ACTIVE) {
            throw OrganizerAccessDeniedException::make('Only active organizers can be suspended.');
        }

        $oldStatus = $organizer->status;

        $this->organizers->update($organizer, [
            'status' => OrganizerStatus::SUSPENDED,
        ]);

        $updated = $this->requireAdminOrganizer($organizer->uuid);
        $this->logOrganizerAdminAction($admin, $updated, 'organizer.suspended', $oldStatus, OrganizerStatus::SUSPENDED);

        return $updated;
    }

    public function activate(Organizer $organizer, User $admin): Organizer
    {
        $this->assertSuperAdmin($admin);

        if ($organizer->status !== OrganizerStatus::SUSPENDED) {
            throw OrganizerAccessDeniedException::make('Only suspended organizers can be reactivated.');
        }

        $oldStatus = $organizer->status;

        $this->organizers->update($organizer, [
            'status' => OrganizerStatus::ACTIVE,
        ]);

        $updated = $this->requireAdminOrganizer($organizer->uuid);
        $this->logOrganizerAdminAction($admin, $updated, 'organizer.activated', $oldStatus, OrganizerStatus::ACTIVE);

        return $updated;
    }

    public function reject(Organizer $organizer, User $admin): Organizer
    {
        $this->assertSuperAdmin($admin);

        if ($organizer->status !== OrganizerStatus::PENDING) {
            throw OrganizerAccessDeniedException::make('Only pending organizers can be rejected.');
        }

        $oldStatus = $organizer->status;

        $this->organizers->update($organizer, [
            'status' => OrganizerStatus::ARCHIVED,
        ]);

        $updated = $this->requireAdminOrganizer($organizer->uuid);
        $this->logOrganizerAdminAction($admin, $updated, 'organizer.rejected', $oldStatus, OrganizerStatus::ARCHIVED);

        return $updated;
    }

    private function requireAdminOrganizer(string $uuid): Organizer
    {
        $organizer = $this->organizers->findByUuidForAdmin($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        return $organizer;
    }

    private function logOrganizerAdminAction(
        User $admin,
        Organizer $organizer,
        string $event,
        string $oldStatus,
        string $newStatus,
    ): void {
        $this->auditLogs->record(
            category: 'admin',
            event: $event,
            user: $admin,
            auditable: $organizer,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $newStatus],
            organizerId: $organizer->id,
        );

        $this->activityLogs->record(
            action: $event,
            subjectType: Organizer::class,
            subjectId: $organizer->id,
            user: $admin,
            organizerId: $organizer->id,
            properties: [
                'organizer_name' => $organizer->name,
                'old_status' => $oldStatus,
                'new_status' => $newStatus,
            ],
        );
    }

    private function assertMemberOrSuperAdmin(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if ($this->members->findActiveMembership($user->id, $organizer->id) === null) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    private function assertCanManageOrganizer(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! $membership->canManageMembers()) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
