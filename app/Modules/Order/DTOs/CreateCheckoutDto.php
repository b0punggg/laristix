<?php

namespace App\Modules\Order\DTOs;

final class CreateCheckoutDto
{
    public function __construct(
        public readonly string $eventUuid,
        public readonly int $ticketTypeId,
        public readonly int $quantity,
        public readonly string $buyerName,
        public readonly string $buyerEmail,
        public readonly ?string $buyerPhone,
        public readonly ?int $userId,
        public readonly ?string $idempotencyKey,
        public readonly ?string $ipAddress,
        public readonly ?string $userAgent,
    ) {}
}
