<?php

namespace App\Modules\Payment\Contracts;

interface PaymentGatewayInterface
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, mixed>
     */
    public function createSnapTransaction(array $payload): array;

    /**
     * @return array<string, mixed>
     */
    public function getTransactionStatus(string $orderId): array;

    public function verifyNotificationSignature(
        string $orderId,
        string $statusCode,
        string $grossAmount,
        string $signatureKey
    ): bool;
}
