<?php

namespace App\Modules\Event\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicCreatorResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $activeCount = (int) ($this->active_events_count ?? 0);
        $pastCount = (int) ($this->past_events_count ?? 0);

        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'name' => $this->name,
            'slug' => $this->slug,
            'logo_url' => $this->logo_url,
            'description' => $this->description,
            'website' => $this->website,
            'active_events_count' => $activeCount,
            'past_events_count' => $pastCount,
            'total_events_count' => $activeCount + $pastCount,
            'joined_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
