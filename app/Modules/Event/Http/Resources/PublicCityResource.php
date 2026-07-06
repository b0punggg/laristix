<?php

namespace App\Modules\Event\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class PublicCityResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'city' => $this->resource['city'] ?? $this->city,
            'events_count' => (int) ($this->resource['events_count'] ?? $this->events_count ?? 0),
        ];
    }
}
