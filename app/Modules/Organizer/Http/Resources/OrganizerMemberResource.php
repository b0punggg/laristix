<?php

namespace App\Modules\Organizer\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class OrganizerMemberResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'organizer_id' => $this->organizer_id,
            'role' => $this->role,
            'status' => $this->status,
            'invited_at' => $this->invited_at?->toIso8601String(),
            'accepted_at' => $this->accepted_at?->toIso8601String(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->id,
                'uuid' => $this->user->uuid,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'avatar_url' => $this->user->avatar_url,
            ]),
            'invited_by' => $this->whenLoaded('invitedBy', fn () => $this->invitedBy ? [
                'id' => $this->invitedBy->id,
                'name' => $this->invitedBy->name,
            ] : null),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
