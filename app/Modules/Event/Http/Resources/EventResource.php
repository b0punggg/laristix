<?php

namespace App\Modules\Event\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'organizer_id' => $this->organizer_id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'banner_url' => $this->banner_url,
            'status' => $this->status,
            'visibility' => $this->visibility,
            'start_at' => $this->start_at?->toIso8601String(),
            'end_at' => $this->end_at?->toIso8601String(),
            'timezone' => $this->timezone,
            'capacity' => $this->capacity,
            'is_free' => $this->is_free,
            'min_ticket_price' => $this->when(
                $this->min_ticket_price !== null,
                fn () => (float) $this->min_ticket_price
            ),
            'tickets_remaining' => $this->when(
                $this->tickets_quantity !== null,
                fn () => max(
                    0,
                    (int) $this->tickets_quantity
                    - (int) ($this->tickets_sold ?? 0)
                    - (int) ($this->tickets_reserved ?? 0)
                )
            ),
            'settings' => $this->settings,
            'published_at' => $this->published_at?->toIso8601String(),
            'venue' => new VenueResource($this->whenLoaded('venue')),
            'category' => new EventCategoryResource($this->whenLoaded('category')),
            'categories' => EventCategoryResource::collection($this->whenLoaded('categories')),
            'tags' => EventTagResource::collection($this->whenLoaded('tags')),
            'created_by' => $this->whenLoaded('createdBy', fn () => [
                'id' => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),
            'organizer' => $this->whenLoaded('organizer', fn () => [
                'id' => $this->organizer->id,
                'uuid' => $this->organizer->uuid,
                'name' => $this->organizer->name,
                'slug' => $this->organizer->slug,
                'logo_url' => $this->organizer->logo_url,
            ]),
            'management' => $this->when($request->user() !== null, fn () => [
                'can_edit' => $this->canEdit(),
                'can_publish' => $this->canPublish(),
                'can_draft' => $this->canRevertToDraft(),
                'can_delete' => $this->canDelete(),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
