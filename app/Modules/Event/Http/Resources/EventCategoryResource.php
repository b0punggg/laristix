<?php

namespace App\Modules\Event\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EventCategoryResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'is_global' => $this->isGlobal(),
            'events_count' => $this->when(
                isset($this->events_count),
                (int) $this->events_count
            ),
        ];
    }
}
