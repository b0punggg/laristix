<?php

namespace App\Modules\Order\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class FormFieldOptionResource extends JsonResource
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
            'value' => $this->value,
            'sort_order' => $this->sort_order,
        ];
    }
}
