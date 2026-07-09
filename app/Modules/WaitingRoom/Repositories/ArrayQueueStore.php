<?php

namespace App\Modules\WaitingRoom\Repositories;

use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;

final class ArrayQueueStore implements QueueStoreInterface
{
    /** @var array<int, bool> */
    private static array $activeQueues = [];

    /** @var array<int, int> */
    private static array $activatedAt = [];

    /** @var array<int, list<array{token: string, score: float}>> */
    private static array $waiting = [];

    /** @var array<int, list<array{token: string, score: float}>> */
    private static array $admitted = [];

    /** @var array<string, array<string, mixed>> */
    private static array $sessions = [];

    /** @var array<int, list<float>> */
    private static array $traffic = [];

    /** @var list<int> */
    private static array $activeEvents = [];

    /** @var array<int, int> */
    private static array $lastPromoteAt = [];

    /** @var array<int, int> */
    private static array $promotedTotals = [];

    public function incrementTraffic(int $eventId, int $windowSeconds): int
    {
        $now = microtime(true);
        $cutoff = $now - $windowSeconds;

        self::$traffic[$eventId] = array_values(array_filter(
            self::$traffic[$eventId] ?? [],
            static fn (float $timestamp): bool => $timestamp >= $cutoff,
        ));

        self::$traffic[$eventId][] = $now;

        return count(self::$traffic[$eventId]);
    }

    public function getTrafficCount(int $eventId, int $windowSeconds): int
    {
        $now = microtime(true);
        $cutoff = $now - $windowSeconds;

        self::$traffic[$eventId] = array_values(array_filter(
            self::$traffic[$eventId] ?? [],
            static fn (float $timestamp): bool => $timestamp >= $cutoff,
        ));

        return count(self::$traffic[$eventId]);
    }

    public function setQueueActive(int $eventId, bool $active): void
    {
        self::$activeQueues[$eventId] = $active;

        if ($active) {
            self::$activatedAt[$eventId] = time();
            $this->trackActiveEvent($eventId);
        }
    }

    public function isQueueActive(int $eventId): bool
    {
        return self::$activeQueues[$eventId] ?? false;
    }

    public function getQueueActivatedAt(int $eventId): ?int
    {
        return self::$activatedAt[$eventId] ?? null;
    }

    public function addToWaiting(int $eventId, string $sessionToken, float $score): void
    {
        $queue = self::$waiting[$eventId] ?? [];
        $queue = array_values(array_filter(
            $queue,
            static fn (array $entry): bool => $entry['token'] !== $sessionToken,
        ));
        $queue[] = ['token' => $sessionToken, 'score' => $score];
        usort($queue, static fn (array $a, array $b): int => $a['score'] <=> $b['score']);
        self::$waiting[$eventId] = $queue;
        $this->trackActiveEvent($eventId);
    }

    public function getWaitingPosition(int $eventId, string $sessionToken): ?int
    {
        foreach (self::$waiting[$eventId] ?? [] as $index => $entry) {
            if ($entry['token'] === $sessionToken) {
                return $index + 1;
            }
        }

        return null;
    }

    public function getWaitingCount(int $eventId): int
    {
        return count(self::$waiting[$eventId] ?? []);
    }

    public function popWaitingBatch(int $eventId, int $limit): array
    {
        $queue = self::$waiting[$eventId] ?? [];
        $batch = array_slice($queue, 0, $limit);
        self::$waiting[$eventId] = array_slice($queue, $limit);

        return array_map(static fn (array $entry): string => $entry['token'], $batch);
    }

    public function addToAdmitted(int $eventId, string $sessionToken, float $score): void
    {
        $queue = self::$admitted[$eventId] ?? [];
        $queue = array_values(array_filter(
            $queue,
            static fn (array $entry): bool => $entry['token'] !== $sessionToken,
        ));
        $queue[] = ['token' => $sessionToken, 'score' => $score];
        self::$admitted[$eventId] = $queue;
    }

    public function isAdmitted(int $eventId, string $sessionToken): bool
    {
        foreach (self::$admitted[$eventId] ?? [] as $entry) {
            if ($entry['token'] === $sessionToken) {
                return true;
            }
        }

        return false;
    }

    public function removeAdmitted(int $eventId, string $sessionToken): void
    {
        self::$admitted[$eventId] = array_values(array_filter(
            self::$admitted[$eventId] ?? [],
            static fn (array $entry): bool => $entry['token'] !== $sessionToken,
        ));
    }

    public function getAdmittedCount(int $eventId): int
    {
        return count(self::$admitted[$eventId] ?? []);
    }

    public function saveSession(string $sessionToken, array $data, int $ttlSeconds): void
    {
        $data['expires_at'] = time() + $ttlSeconds;
        self::$sessions[$sessionToken] = $data;
    }

    public function getSession(string $sessionToken): ?array
    {
        $session = self::$sessions[$sessionToken] ?? null;

        if ($session === null) {
            return null;
        }

        if (($session['expires_at'] ?? 0) < time()) {
            unset(self::$sessions[$sessionToken]);

            return null;
        }

        return $session;
    }

    public function deleteSession(string $sessionToken): void
    {
        unset(self::$sessions[$sessionToken]);
    }

    public function getActiveEventIds(): array
    {
        return array_values(array_unique(self::$activeEvents));
    }

    public function trackActiveEvent(int $eventId): void
    {
        if (! in_array($eventId, self::$activeEvents, true)) {
            self::$activeEvents[] = $eventId;
        }
    }

    public function getLastPromoteAt(int $eventId): ?int
    {
        return self::$lastPromoteAt[$eventId] ?? null;
    }

    public function setLastPromoteAt(int $eventId, int $timestamp): void
    {
        self::$lastPromoteAt[$eventId] = $timestamp;
    }

    public function incrementPromotedTotal(int $eventId, int $count = 1): void
    {
        self::$promotedTotals[$eventId] = (self::$promotedTotals[$eventId] ?? 0) + max(0, $count);
    }

    public function getPromotedTotal(int $eventId): int
    {
        return self::$promotedTotals[$eventId] ?? 0;
    }

    public function resetPromotedTotal(int $eventId): void
    {
        unset(self::$promotedTotals[$eventId]);
    }

    public static function reset(): void
    {
        self::$activeQueues = [];
        self::$activatedAt = [];
        self::$waiting = [];
        self::$admitted = [];
        self::$sessions = [];
        self::$traffic = [];
        self::$activeEvents = [];
        self::$lastPromoteAt = [];
        self::$promotedTotals = [];
    }
}
