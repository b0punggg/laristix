<?php

namespace App\Modules\Auth\Http\Resources;

use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizerSummaryResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        /** @var Organizer $organizer */
        $organizer = $this->resource;

        $membership = OrganizerMember::query()
            ->where('organizer_id', $organizer->id)
            ->where('user_id', optional($request->user())->id)
            ->where('status', 'active')
            ->first();

        return [
            'id' => $organizer->id,
            'uuid' => $organizer->uuid,
            'name' => $organizer->name,
            'slug' => $organizer->slug,
            'logo_url' => $organizer->logo_url,
            'status' => $organizer->status,
            'membership' => $membership ? [
                'id' => $membership->id,
                'role' => $membership->role,
            ] : null,
        ];
    }
}
