<?php

namespace App\Modules\Organizer\Http\Resources;

use App\Modules\Organizer\Enums\OrganizerMemberRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminOrganizerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $ownerMember = $this->relationLoaded('members')
            ? $this->members->first(
                fn ($member) => $member->role === OrganizerMemberRole::OWNER && $member->status === 'active'
            )
            : null;

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'email' => $this->email,
            'phone' => $this->phone,
            'logo_url' => $this->logo_url,
            'website' => $this->website,
            'description' => $this->description,
            'country_code' => $this->country_code,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'status' => $this->status,
            'events_count' => $this->when(isset($this->events_count), (int) $this->events_count),
            'owner' => $this->when(
                $ownerMember !== null && $ownerMember->relationLoaded('user') && $ownerMember->user !== null,
                fn () => [
                    'name' => $ownerMember->user->name,
                    'email' => $ownerMember->user->email,
                ]
            ),
            'approved_at' => $this->approved_at?->toIso8601String(),
            'approved_by' => $this->when(
                $this->relationLoaded('approvedBy') && $this->approvedBy !== null,
                fn () => [
                    'id' => $this->approvedBy->id,
                    'name' => $this->approvedBy->name,
                    'email' => $this->approvedBy->email,
                ]
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
