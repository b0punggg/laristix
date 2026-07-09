<?php

namespace App\Modules\WaitingRoom\Repositories;

use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;
use Illuminate\Support\Facades\Redis;

final class RedisQueueStore implements QueueStoreInterface
{
    public function incrementTraffic(int $eventId, int $windowSeconds): int
    {
        $key = $this->trafficKey($eventId);
        $now = microtime(true);
        $member = uniqid((string) $eventId, true);

        Redis::zadd($key, $now, $member);
        Redis::zremrangebyscore($key, '-inf', (string) ($now - $windowSeconds));
        Redis::expire($key, max($windowSeconds * 3, 60));

        return (int) Redis::zcard($key);
    }

    public function getTrafficCount(int $eventId, int $windowSeconds): int
    {
        $key = $this->trafficKey($eventId);
        $now = microtime(true);

        Redis::zremrangebyscore($key, '-inf', (string) ($now - $windowSeconds));

        return (int) Redis::zcard($key);
    }

    public function setQueueActive(int $eventId, bool $active): void
    {
        $key = $this->activeKey($eventId);

        if ($active) {
            Redis::set($key, (string) time());
            $this->trackActiveEvent($eventId);
        } else {
            Redis::del($key);
        }
    }

    public function isQueueActive(int $eventId): bool
    {
        return Redis::exists($this->activeKey($eventId)) === 1;
    }

    public function getQueueActivatedAt(int $eventId): ?int
    {
        $value = Redis::get($this->activeKey($eventId));

        return $value !== null ? (int) $value : null;
    }

    public function addToWaiting(int $eventId, string $sessionToken, float $score): void
    {
        Redis::zadd($this->waitingKey($eventId), $score, $sessionToken);
        $this->trackActiveEvent($eventId);
    }

    public function getWaitingPosition(int $eventId, string $sessionToken): ?int
    {
        $rank = Redis::zrank($this->waitingKey($eventId), $sessionToken);

        return $rank === null ? null : $rank + 1;
    }

    public function getWaitingCount(int $eventId): int
    {
        return (int) Redis::zcard($this->waitingKey($eventId));
    }

    public function popWaitingBatch(int $eventId, int $limit): array
    {
        if ($limit <= 0) {
            return [];
        }

        $results = Redis::zpopmin($this->waitingKey($eventId), $limit);

        if ($results === null || $results === []) {
            return [];
        }

        return array_keys($results);
    }

    public function addToAdmitted(int $eventId, string $sessionToken, float $score): void
    {
        Redis::zadd($this->admittedKey($eventId), $score, $sessionToken);
    }

    public function isAdmitted(int $eventId, string $sessionToken): bool
    {
        $score = Redis::zscore($this->admittedKey($eventId), $sessionToken);

        return $score !== null && $score !== false;
    }

    public function removeAdmitted(int $eventId, string $sessionToken): void
    {
        Redis::zrem($this->admittedKey($eventId), $sessionToken);
    }

    public function getAdmittedCount(int $eventId): int
    {
        return (int) Redis::zcard($this->admittedKey($eventId));
    }

    public function saveSession(string $sessionToken, array $data, int $ttlSeconds): void
    {
        Redis::setex($this->sessionKey($sessionToken), $ttlSeconds, json_encode($data, JSON_THROW_ON_ERROR));
    }

    public function getSession(string $sessionToken): ?array
    {
        $payload = Redis::get($this->sessionKey($sessionToken));

        if ($payload === null) {
            return null;
        }

        /** @var array<string, mixed> $decoded */
        $decoded = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);

        return $decoded;
    }

    public function deleteSession(string $sessionToken): void
    {
        Redis::del($this->sessionKey($sessionToken));
    }

    public function getActiveEventIds(): array
    {
        $members = Redis::smembers($this->activeEventsKey());

        return array_map(static fn (string $id): int => (int) $id, $members);
    }

    public function trackActiveEvent(int $eventId): void
    {
        Redis::sadd($this->activeEventsKey(), (string) $eventId);
    }

    public function getLastPromoteAt(int $eventId): ?int
    {
        $value = Redis::get($this->lastPromoteKey($eventId));

        return $value !== null ? (int) $value : null;
    }

    public function setLastPromoteAt(int $eventId, int $timestamp): void
    {
        Redis::set($this->lastPromoteKey($eventId), (string) $timestamp);
    }

    public function incrementPromotedTotal(int $eventId, int $count = 1): void
    {
        if ($count <= 0) {
            return;
        }

        Redis::incrby($this->promotedTotalKey($eventId), $count);
    }

    public function getPromotedTotal(int $eventId): int
    {
        return (int) Redis::get($this->promotedTotalKey($eventId));
    }

    public function resetPromotedTotal(int $eventId): void
    {
        Redis::del($this->promotedTotalKey($eventId));
    }

    private function activeKey(int $eventId): string
    {
        return "wr:event:{$eventId}:active";
    }

    private function waitingKey(int $eventId): string
    {
        return "wr:event:{$eventId}:waiting";
    }

    private function admittedKey(int $eventId): string
    {
        return "wr:event:{$eventId}:admitted";
    }

    private function trafficKey(int $eventId): string
    {
        return "wr:event:{$eventId}:traffic";
    }

    private function sessionKey(string $sessionToken): string
    {
        return "wr:session:{$sessionToken}";
    }

    private function activeEventsKey(): string
    {
        return 'wr:active-events';
    }

    private function lastPromoteKey(int $eventId): string
    {
        return "wr:event:{$eventId}:last-promote";
    }

    private function promotedTotalKey(int $eventId): string
    {
        return "wr:event:{$eventId}:promoted-total";
    }
}
