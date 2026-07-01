<?php

namespace App\Modules\Organizer\Services;

use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\CreateOrganizerServiceInterface;
use App\Modules\Organizer\DTOs\CreateOrganizerDto;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Exceptions\OrganizerSlugTakenException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateOrganizerService implements CreateOrganizerServiceInterface
{
    /** @var OrganizerRepositoryInterface */
    private $organizers;

    /** @var OrganizerMemberRepositoryInterface */
    private $members;

    /** @var RoleServiceInterface */
    private $roleService;

    /** @var ActiveOrganizerServiceInterface */
    private $activeOrganizerService;

    public function __construct(
        OrganizerRepositoryInterface $organizers,
        OrganizerMemberRepositoryInterface $members,
        RoleServiceInterface $roleService,
        ActiveOrganizerServiceInterface $activeOrganizerService
    ) {
        $this->organizers = $organizers;
        $this->members = $members;
        $this->roleService = $roleService;
        $this->activeOrganizerService = $activeOrganizerService;
    }

    public function create(User $user, CreateOrganizerDto $dto): Organizer
    {
        $slug = $this->resolveSlug($dto->name, $dto->slug);

        if ($this->organizers->slugExists($slug)) {
            throw OrganizerSlugTakenException::make($slug);
        }

        return DB::transaction(function () use ($user, $dto, $slug) {
            $status = config('organizer_module.auto_approve', false)
                ? OrganizerStatus::ACTIVE
                : OrganizerStatus::PENDING;

            $organizer = $this->organizers->create([
                'name' => $dto->name,
                'slug' => $slug,
                'email' => $dto->email,
                'phone' => $dto->phone,
                'description' => $dto->description,
                'website' => $dto->website,
                'country_code' => $dto->countryCode ?? config('organizer_module.default_country'),
                'currency' => $dto->currency ?? config('organizer_module.default_currency'),
                'timezone' => $dto->timezone ?? config('organizer_module.default_timezone'),
                'status' => $status,
                'approved_at' => $status === OrganizerStatus::ACTIVE ? now() : null,
            ]);

            $this->members->create([
                'organizer_id' => $organizer->id,
                'user_id' => $user->id,
                'role' => OrganizerMemberRole::OWNER,
                'status' => 'active',
                'accepted_at' => now(),
            ]);

            $this->activeOrganizerService->switch($user, $organizer->id);
            $this->roleService->syncUserRoles($user, $organizer->id);

            return $organizer->fresh(['members']);
        });
    }

    private function resolveSlug(string $name, ?string $slug): string
    {
        $base = Str::slug($slug ?: $name);

        if ($base === '') {
            $base = 'organizer';
        }

        $candidate = $base;
        $suffix = 1;

        while ($this->organizers->slugExists($candidate)) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
