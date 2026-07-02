<?php

namespace App\Modules\Organizer\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\DTOs\StoreOrganizerFeeConfigDto;
use App\Modules\Organizer\DTOs\UpdateOrganizerFeeConfigDto;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use Illuminate\Support\Collection;

interface OrganizerFeeConfigServiceInterface
{
    /**
     * @return Collection<int, OrganizerFeeConfig>
     */
    public function listForOrganizer(Organizer $organizer, User $admin): Collection;

    public function create(Organizer $organizer, User $admin, StoreOrganizerFeeConfigDto $dto): OrganizerFeeConfig;

    public function update(OrganizerFeeConfig $config, User $admin, UpdateOrganizerFeeConfigDto $dto): OrganizerFeeConfig;

    public function delete(OrganizerFeeConfig $config, User $admin): void;
}
