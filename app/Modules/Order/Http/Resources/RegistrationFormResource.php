<?php

namespace App\Modules\Order\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationFormResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->when(isset($this->id), $this->id),
            'event_id' => $this->event_id,
            'title' => $this->title,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'fields' => FormFieldResource::collection($this->whenLoaded('fields')),
        ];
    }
}
