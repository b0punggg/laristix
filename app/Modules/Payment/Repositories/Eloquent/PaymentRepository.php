<?php

namespace App\Modules\Payment\Repositories\Eloquent;

use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\PaymentLog;
use App\Modules\Payment\Repositories\Contracts\PaymentRepositoryInterface;

class PaymentRepository implements PaymentRepositoryInterface
{
    public function findByGatewayTransaction(string $gateway, string $transactionId): ?Payment
    {
        return Payment::withoutOrganizerScope()
            ->with('order')
            ->where('gateway', $gateway)
            ->where('gateway_transaction_id', $transactionId)
            ->first();
    }

    public function create(array $attributes): Payment
    {
        return Payment::withoutOrganizerScope()->create($attributes);
    }

    public function update(Payment $payment, array $attributes): Payment
    {
        $payment->fill($attributes);
        $payment->save();

        return $payment->fresh();
    }

    public function createLog(array $attributes): PaymentLog
    {
        return PaymentLog::withoutOrganizerScope()->create($attributes);
    }

    public function logExists(string $gateway, string $gatewayEventId): bool
    {
        if ($gatewayEventId === '') {
            return false;
        }

        return PaymentLog::withoutOrganizerScope()
            ->where('gateway', $gateway)
            ->where('gateway_event_id', $gatewayEventId)
            ->exists();
    }
}
