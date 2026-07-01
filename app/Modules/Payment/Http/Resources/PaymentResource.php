<?php

namespace App\Modules\Payment\Http\Resources;

use App\Modules\Payment\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        if ($this->resource === null) {
            return [];
        }

        return [
            'uuid' => $this->uuid,
            'gateway' => $this->gateway,
            'gateway_transaction_id' => $this->gateway_transaction_id,
            'payment_method' => $this->payment_method,
            'status' => $this->status,
            'status_label' => PaymentStatus::label($this->status),
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'paid_at' => $this->paid_at?->toIso8601String(),
            'expired_at' => $this->expired_at?->toIso8601String(),
        ];
    }
}
