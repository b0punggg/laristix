<?php

namespace App\Modules\Organizer\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrganizerFeeConfigResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organizer_id' => $this->organizer_id,
            'fee_type' => $this->fee_type,
            'percentage_rate' => (float) $this->percentage_rate,
            'flat_amount' => (float) $this->flat_amount,
            'fee_bearer' => $this->fee_bearer,
            'effective_from' => $this->effective_from?->toIso8601String(),
            'effective_until' => $this->effective_until?->toIso8601String(),
            'notes' => $this->notes,
            'created_by' => $this->when(
                $this->relationLoaded('createdBy') && $this->createdBy !== null,
                fn () => [
                    'id' => $this->createdBy->id,
                    'name' => $this->createdBy->name,
                    'email' => $this->createdBy->email,
                ]
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
