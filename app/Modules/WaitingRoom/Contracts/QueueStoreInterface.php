<?php

namespace App\Modules\WaitingRoom\Contracts;

interface QueueStoreInterface
{
    public function incrementTraffic(int $eventId, int $windowSeconds): int;

    public function getTrafficCount(int $eventId, int $windowSeconds): int;

    public function setQueueActive(int $eventId, bool $active): void;

    public function isQueueActive(int $eventId): bool;

    public function getQueueActivatedAt(int $eventId): ?int;

    public function addToWaiting(int $eventId, string $sessionToken, float $score): void;

    public function getWaitingPosition(int $eventId, string $sessionToken): ?int;

    public function getWaitingCount(int $eventId): int;

    /**
     * @return list<string>
     */
    public function popWaitingBatch(int $eventId, int $limit): array;

    public function addToAdmitted(int $eventId, string $sessionToken, float $score): void;

    public function isAdmitted(int $eventId, string $sessionToken): bool;

    public function removeAdmitted(int $eventId, string $sessionToken): void;

    public function getAdmittedCount(int $eventId): int;

    /**
     * @param  array<string, mixed>  $data
     */
    public function saveSession(string $sessionToken, array $data, int $ttlSeconds): void;

    /**
     * @return array<string, mixed>|null
     */
    public function getSession(string $sessionToken): ?array;

    public function deleteSession(string $sessionToken): void;

    /**
     * @return list<int>
     */
    public function getActiveEventIds(): array;

    public function trackActiveEvent(int $eventId): void;

    public function getLastPromoteAt(int $eventId): ?int;

    public function setLastPromoteAt(int $eventId, int $timestamp): void;

    public function incrementPromotedTotal(int $eventId, int $count = 1): void;

    public function getPromotedTotal(int $eventId): int;

    public function resetPromotedTotal(int $eventId): void;
}
