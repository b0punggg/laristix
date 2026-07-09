<?php

namespace App\Modules\WaitingRoom\Contracts;

interface WaitingRoomMonitoringServiceInterface
{
    /**
     * @return array{
     *   summary: array<string, int|float>,
     *   queues: list<array<string, mixed>>,
     *   config: array<string, int|bool>
     * }
     */
    public function listQueues(?string $search = null, bool $activeOnly = false): array;

    /**
     * @return array<string, mixed>
     */
    public function showEvent(string $eventUuid): array;

    public function promoteEvent(string $eventUuid): int;
}
