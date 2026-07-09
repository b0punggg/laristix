<?php

namespace App\Modules\Order\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FormFieldResource extends JsonResource
{
    /**
     * @param  \Illuminate\Http\Request  $request
     * @return array<string, mixed>
     */
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'name' => $this->name,
            'type' => $this->type,
            'placeholder' => $this->placeholder,
            'help_text' => $this->help_text,
            'is_required' => $this->is_required,
            'sort_order' => $this->sort_order,
            'is_active' => $this->is_active,
            'options' => FormFieldOptionResource::collection($this->whenLoaded('options')),
        ];
    }
}
