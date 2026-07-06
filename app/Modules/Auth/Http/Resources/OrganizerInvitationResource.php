<?php

namespace App\Modules\Auth\Http\Resources;

use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizerInvitationResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        /** @var OrganizerMember $member */
        $member = $this->resource;
        $organizer = $member->organizer;

        return [
            'id' => $member->id,
            'role' => $member->role,
            'status' => $member->status,
            'invited_at' => $member->invited_at?->toIso8601String(),
            'organizer' => $organizer ? [
                'id' => $organizer->id,
                'uuid' => $organizer->uuid,
                'name' => $organizer->name,
                'slug' => $organizer->slug,
                'logo_url' => $organizer->logo_url,
                'status' => $organizer->status,
            ] : null,
            'invited_by' => $member->relationLoaded('invitedBy') && $member->invitedBy ? [
                'id' => $member->invitedBy->id,
                'name' => $member->invitedBy->name,
            ] : null,
        ];
    }
}
