<?php

namespace App\Modules\Order\Http\Resources;

use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Http\Resources\PaymentResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'order_number' => $this->order_number,
            'status' => $this->status,
            'buyer_name' => $this->buyer_name,
            'buyer_email' => $this->buyer_email,
            'buyer_phone' => $this->buyer_phone,
            'currency' => $this->currency,
            'subtotal' => (float) $this->subtotal,
            'discount_amount' => (float) $this->discount_amount,
            'platform_fee_total' => (float) $this->platform_fee_total,
            'total_amount' => (float) $this->total_amount,
            'expires_at' => $this->expires_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'event' => $this->whenLoaded('event', function () {
                $event = $this->event;

                return [
                    'uuid' => $event->uuid,
                    'title' => $event->title,
                    'slug' => $event->slug,
                    'banner_url' => $event->banner_url,
                    'start_at' => $event->start_at?->toIso8601String(),
                    'end_at' => $event->end_at?->toIso8601String(),
                    'timezone' => $event->timezone,
                    'venue' => $event->relationLoaded('venue') && $event->venue
                        ? [
                            'name' => $event->venue->name,
                            'city' => $event->venue->city,
                            'province' => $event->venue->province,
                            'address' => $event->venue->address,
                        ]
                        : null,
                    'category' => $event->relationLoaded('category') && $event->category
                        ? [
                            'name' => $event->category->name,
                            'slug' => $event->category->slug,
                        ]
                        : null,
                ];
            }),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'registrations' => RegistrationResource::collection($this->whenLoaded('registrations')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
