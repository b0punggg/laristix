<?php

namespace App\Modules\Order\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckoutResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        /** @var array{order: \App\Modules\Order\Models\Order, snap_token: string|null, client_key: string|null} $payload */
        $payload = $this->resource;

        return [
            'order' => new OrderResource($payload['order']),
            'snap_token' => $payload['snap_token'],
            'client_key' => $payload['client_key'],
        ];
    }
}
