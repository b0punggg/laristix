<?php

namespace App\Modules\Organizer\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerFeeConfigServiceInterface;
use App\Modules\Organizer\DTOs\StoreOrganizerFeeConfigDto;
use App\Modules\Organizer\DTOs\UpdateOrganizerFeeConfigDto;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class OrganizerFeeConfigService implements OrganizerFeeConfigServiceInterface
{
    public function __construct(
        private readonly AuditLogServiceInterface $auditLogs,
    ) {}

    public function listForOrganizer(Organizer $organizer, User $admin): Collection
    {
        $this->assertSuperAdmin($admin);

        return OrganizerFeeConfig::query()
            ->where('organizer_id', $organizer->id)
            ->with('createdBy:id,name,email')
            ->orderByDesc('effective_from')
            ->get();
    }

    public function create(Organizer $organizer, User $admin, StoreOrganizerFeeConfigDto $dto): OrganizerFeeConfig
    {
        $this->assertSuperAdmin($admin);

        $effectiveFrom = Carbon::parse($dto->effectiveFrom);

        $this->closeOverlappingConfigs($organizer->id, $effectiveFrom);

        $config = OrganizerFeeConfig::query()->create($dto->toArray($organizer->id, $admin->id));

        $this->auditLogs->record(
            category: 'admin',
            event: 'organizer_fee_config.created',
            user: $admin,
            auditable: $config,
            newValues: $dto->toArray($organizer->id, $admin->id),
            organizerId: $organizer->id,
        );

        return $config;
    }

    public function update(OrganizerFeeConfig $config, User $admin, UpdateOrganizerFeeConfigDto $dto): OrganizerFeeConfig
    {
        $this->assertSuperAdmin($admin);

        if ($config->effective_from->isPast()) {
            throw OrganizerAccessDeniedException::make('Only future fee configs can be edited.');
        }

        $config->fill($dto->toArray());
        $config->save();

        return $config->fresh(['createdBy:id,name,email']);
    }

    public function delete(OrganizerFeeConfig $config, User $admin): void
    {
        $this->assertSuperAdmin($admin);

        if ($config->effective_from->isPast()) {
            throw OrganizerAccessDeniedException::make('Only future fee configs can be deleted.');
        }

        $configId = $config->id;

        $config->delete();

        $this->auditLogs->record(
            category: 'admin',
            event: 'organizer_fee_config.deleted',
            user: $admin,
            auditable: null,
            metadata: ['fee_config_id' => $configId, 'organizer_id' => $config->organizer_id],
            organizerId: $config->organizer_id,
        );
    }

    private function closeOverlappingConfigs(int $organizerId, Carbon $effectiveFrom): void
    {
        OrganizerFeeConfig::query()
            ->where('organizer_id', $organizerId)
            ->where('effective_from', '<=', $effectiveFrom)
            ->where(function ($query) use ($effectiveFrom) {
                $query->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', $effectiveFrom);
            })
            ->update([
                'effective_until' => $effectiveFrom->copy()->subSecond(),
            ]);
    }

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
