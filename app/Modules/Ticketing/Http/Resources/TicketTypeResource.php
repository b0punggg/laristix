<?php

namespace App\Modules\Ticketing\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketTypeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_id' => $this->event_id,
            'organizer_id' => $this->organizer_id,
            'name' => $this->name,
            'kind' => $this->kind,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'quantity' => $this->quantity,
            'sold_count' => $this->sold_count,
            'reserved_count' => $this->reserved_count,
            'available_quantity' => $this->availableQuantity(),
            'min_per_order' => $this->min_per_order,
            'max_per_order' => $this->max_per_order,
            'sales_start_at' => $this->sales_start_at?->toIso8601String(),
            'sales_end_at' => $this->sales_end_at?->toIso8601String(),
            'visibility' => $this->visibility,
            'sort_order' => $this->sort_order,
            'status' => $this->status,
            'is_free' => $this->isFree(),
            'is_sold_out' => $this->isSoldOut(),
            'is_sales_open' => $this->isSalesOpen(),
            'is_purchasable' => $this->isPurchasable(),
            'management' => $this->when($request->user() !== null, fn () => [
                'can_edit' => $this->canEdit(),
                'can_delete' => $this->canDelete(),
            ]),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
