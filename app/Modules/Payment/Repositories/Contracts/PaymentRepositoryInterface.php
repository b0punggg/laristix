<?php

namespace App\Modules\Payment\Repositories\Contracts;

use App\Modules\Payment\Models\Payment;
use App\Modules\Payment\Models\PaymentLog;

interface PaymentRepositoryInterface
{
    public function findByGatewayTransaction(string $gateway, string $transactionId): ?Payment;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Payment;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Payment $payment, array $attributes): Payment;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function createLog(array $attributes): PaymentLog;

    public function logExists(string $gateway, string $gatewayEventId): bool;
}
