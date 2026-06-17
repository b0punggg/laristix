<?php

namespace App\Modules\Auth\Http\Resources;

use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Organizer */
class OrganizerSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $membership = OrganizerMember::query()
            ->where('organizer_id', $this->id)
            ->where('user_id', $request->user()?->id)
            ->where('status', 'active')
            ->first();

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_url' => $this->logo_url,
            'status' => $this->status,
            'membership' => $membership ? [
                'id' => $membership->id,
                'role' => $membership->role,
            ] : null,
        ];
    }
}
