<?php

namespace App\Modules\Payment\Contracts;

interface PaymentWebhookServiceInterface
{
    /**
     * @param  array<string, mixed>  $payload
     * @return array{processed: bool, message: string}
     */
    public function handleMidtransNotification(array $payload, ?string $ipAddress): array;
}
