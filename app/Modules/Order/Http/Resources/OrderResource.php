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
            'event' => $this->whenLoaded('event', fn () => [
                'uuid' => $this->event->uuid,
                'title' => $this->event->title,
                'slug' => $this->event->slug,
            ]),
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payment' => new PaymentResource($this->whenLoaded('payment')),
            'registrations' => RegistrationResource::collection($this->whenLoaded('registrations')),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
