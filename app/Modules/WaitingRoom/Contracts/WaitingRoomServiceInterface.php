<?php

namespace App\Modules\WaitingRoom\Contracts;

use App\Modules\Event\Models\Event;

interface WaitingRoomServiceInterface
{
    /**
     * @return array<string, mixed>
     */
    public function status(Event $event, ?string $sessionToken = null): array;

    /**
     * @return array<string, mixed>
     */
    public function join(
        Event $event,
        ?string $sessionToken,
        ?int $userId,
        ?int $ticketTypeId,
        int $quantity,
    ): array;

    public function recordCheckoutAttempt(int $eventId): void;

    public function activateQueueIfNeeded(int $eventId): void;

    public function isQueueActive(int $eventId): bool;

    public function validateAdmission(int $eventId, ?string $sessionToken): bool;

    public function getOrderTtlMinutes(int $eventId): int;

    public function promoteEvent(int $eventId): int;

    public function promoteAllActiveEvents(): int;

    public function maybeDeactivateQueue(int $eventId): void;
}
