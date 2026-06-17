<?php

namespace App\Modules\Auth\Http\Resources;

use App\Modules\Auth\DTOs\AuthenticatedUserDto;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin AuthenticatedUserDto */
class MeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var AuthenticatedUserDto $dto */
        $dto = $this->resource;

        return [
            'id' => $dto->id,
            'uuid' => $dto->uuid,
            'name' => $dto->name,
            'email' => $dto->email,
            'phone' => $dto->phone,
            'avatar_url' => $dto->avatarUrl,
            'email_verified' => $dto->emailVerified,
            'roles' => $dto->roles,
            'primary_role' => $dto->primaryRole,
            'active_organizer' => $dto->activeOrganizer,
            'active_membership' => $dto->activeMembership,
        ];
    }
}
