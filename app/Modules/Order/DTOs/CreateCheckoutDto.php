<?php

namespace App\Modules\Order\DTOs;

final class CreateCheckoutDto
{
    /**
     * @param  list<array{field_id: int, value: mixed}>  $answers
     * @param  list<array{
     *   name: string,
     *   email?: string|null,
     *   phone?: string|null,
     *   id_number?: string|null,
     *   date_of_birth?: string|null,
     *   gender?: string|null,
     *   answers?: list<array{field_id: int, value: mixed}>
     * }>  $attendees
     */
    public function __construct(
        public readonly string $eventUuid,
        public readonly int $ticketTypeId,
        public readonly int $quantity,
        public readonly string $buyerName,
        public readonly string $buyerEmail,
        public readonly ?string $buyerPhone,
        public readonly ?string $buyerIdNumber,
        public readonly ?string $buyerDateOfBirth,
        public readonly ?string $buyerGender,
        public readonly ?int $userId,
        public readonly ?string $idempotencyKey,
        public readonly ?string $ipAddress,
        public readonly ?string $userAgent,
        public readonly array $answers = [],
        public readonly array $attendees = [],
        public readonly ?string $promoCode = null,
    ) {}
}
