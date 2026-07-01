<?php

namespace App\Modules\Auth\Http\Resources;

use App\Modules\Auth\DTOs\AuthenticatedUserDto;
use Illuminate\Http\Resources\Json\JsonResource;

class MeResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
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
