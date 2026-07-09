<?php

namespace App\Modules\WaitingRoom\Services;

use App\Modules\Event\Models\Event;
use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use Illuminate\Support\Str;

class WaitingRoomService implements WaitingRoomServiceInterface
{
    public function __construct(
        private readonly QueueStoreInterface $store,
    ) {}

    public function status(Event $event, ?string $sessionToken = null): array
    {
        $this->activateQueueIfNeeded($event->id);

        if ($sessionToken !== null) {
            $session = $this->store->getSession($sessionToken);

            if ($session !== null && (int) ($session['event_id'] ?? 0) === $event->id) {
                return $this->buildStatusPayload($event, $sessionToken, $session);
            }
        }

        return $this->buildStatusPayload($event, null, null);
    }

    public function join(
        Event $event,
        ?string $sessionToken,
        ?int $userId,
        ?int $ticketTypeId,
        int $quantity,
    ): array {
        $this->recordCheckoutAttempt($event->id);
        $this->activateQueueIfNeeded($event->id);

        if (! $this->isQueueActive($event->id)) {
            $sessionToken = $this->createAdmittedSession(
                event: $event,
                userId: $userId,
                ticketTypeId: $ticketTypeId,
                quantity: $quantity,
            );

            return $this->buildStatusPayload(
                $event,
                $sessionToken,
                $this->store->getSession($sessionToken),
            );
        }

        if ($sessionToken !== null) {
            $existing = $this->store->getSession($sessionToken);

            if ($existing !== null && (int) ($existing['event_id'] ?? 0) === $event->id) {
                return $this->buildStatusPayload($event, $sessionToken, $existing);
            }
        }

        $sessionToken = (string) Str::uuid();
        $now = now();

        $session = [
            'event_id' => $event->id,
            'event_uuid' => $event->uuid,
            'user_id' => $userId,
            'status' => 'waiting',
            'joined_at' => $now->toIso8601String(),
            'admitted_at' => null,
            'admission_expires_at' => null,
            'ticket_type_id' => $ticketTypeId,
            'quantity' => max(1, $quantity),
        ];

        $this->store->saveSession(
            $sessionToken,
            $session,
            (int) config('waiting_room_module.session_ttl_seconds', 3600),
        );
        $this->store->addToWaiting($event->id, $sessionToken, microtime(true));

        return $this->buildStatusPayload($event, $sessionToken, $session);
    }

    public function recordCheckoutAttempt(int $eventId): void
    {
        if (! config('waiting_room_module.enabled', true)) {
            return;
        }

        $windowSeconds = (int) config('waiting_room_module.traffic.window_seconds', 10);
        $this->store->incrementTraffic($eventId, $windowSeconds);
    }

    public function activateQueueIfNeeded(int $eventId): void
    {
        if (! config('waiting_room_module.enabled', true)) {
            return;
        }

        $windowSeconds = (int) config('waiting_room_module.traffic.window_seconds', 10);
        $threshold = (int) config('waiting_room_module.traffic.threshold', 80);
        $trafficCount = $this->store->getTrafficCount($eventId, $windowSeconds);

        if ($trafficCount >= $threshold) {
            $this->store->setQueueActive($eventId, true);
        }
    }

    public function isQueueActive(int $eventId): bool
    {
        if (! config('waiting_room_module.enabled', true)) {
            return false;
        }

        return $this->store->isQueueActive($eventId);
    }

    public function validateAdmission(int $eventId, ?string $sessionToken): bool
    {
        if (! $this->isQueueActive($eventId)) {
            return true;
        }

        if ($sessionToken === null || $sessionToken === '') {
            return false;
        }

        $session = $this->store->getSession($sessionToken);

        if ($session === null || (int) ($session['event_id'] ?? 0) !== $eventId) {
            return false;
        }

        if (($session['status'] ?? '') !== 'admitted') {
            return false;
        }

        $expiresAt = $session['admission_expires_at'] ?? null;

        if ($expiresAt === null) {
            return false;
        }

        return now()->lt(\Illuminate\Support\Carbon::parse($expiresAt));
    }

    public function getOrderTtlMinutes(int $eventId): int
    {
        if ($this->isQueueActive($eventId)) {
            return (int) config('waiting_room_module.order_ttl_high_demand_minutes', 12);
        }

        return (int) config('waiting_room_module.order_ttl_normal_minutes', 30);
    }

    public function promoteEvent(int $eventId): int
    {
        if (! $this->isQueueActive($eventId)) {
            return 0;
        }

        $interval = (int) config('waiting_room_module.admit_interval_seconds', 180);
        $lastPromoteAt = $this->store->getLastPromoteAt($eventId);

        if ($lastPromoteAt !== null && (time() - $lastPromoteAt) < $interval) {
            return 0;
        }

        $batchSize = (int) config('waiting_room_module.admit_batch_size', 200);
        $tokens = $this->store->popWaitingBatch($eventId, $batchSize);
        $admittedCount = 0;
        $admissionTtl = (int) config('waiting_room_module.admission_token_ttl_seconds', 300);
        $sessionTtl = (int) config('waiting_room_module.session_ttl_seconds', 3600);

        foreach ($tokens as $token) {
            $session = $this->store->getSession($token);

            if ($session === null) {
                continue;
            }

            $admittedAt = now();
            $session['status'] = 'admitted';
            $session['admitted_at'] = $admittedAt->toIso8601String();
            $session['admission_expires_at'] = $admittedAt->copy()->addSeconds($admissionTtl)->toIso8601String();

            $this->store->saveSession($token, $session, $sessionTtl);
            $this->store->addToAdmitted($eventId, $token, microtime(true));
            $admittedCount++;
        }

        if ($admittedCount > 0) {
            $this->store->setLastPromoteAt($eventId, time());
            $this->store->incrementPromotedTotal($eventId, $admittedCount);
        }

        $this->maybeDeactivateQueue($eventId);

        return $admittedCount;
    }

    public function promoteAllActiveEvents(): int
    {
        $promoted = 0;

        foreach ($this->store->getActiveEventIds() as $eventId) {
            $promoted += $this->promoteEvent($eventId);
        }

        return $promoted;
    }

    public function maybeDeactivateQueue(int $eventId): void
    {
        if (! $this->isQueueActive($eventId)) {
            return;
        }

        $activatedAt = $this->store->getQueueActivatedAt($eventId);
        $minActiveSeconds = (int) config('waiting_room_module.traffic.min_active_seconds', 180);

        if ($activatedAt !== null && (time() - $activatedAt) < $minActiveSeconds) {
            return;
        }

        $windowSeconds = (int) config('waiting_room_module.traffic.window_seconds', 10);
        $threshold = (int) config('waiting_room_module.traffic.threshold', 80);
        $trafficCount = $this->store->getTrafficCount($eventId, $windowSeconds);

        if ($trafficCount >= $threshold) {
            return;
        }

        if ($this->store->getWaitingCount($eventId) > 0) {
            return;
        }

        if ($this->store->getAdmittedCount($eventId) > 0) {
            return;
        }

        $this->store->setQueueActive($eventId, false);
        $this->store->resetPromotedTotal($eventId);
    }

    /**
     * @param  array<string, mixed>|null  $session
     * @return array<string, mixed>
     */
    private function buildStatusPayload(Event $event, ?string $sessionToken, ?array $session): array
    {
        $queueActive = $this->isQueueActive($event->id);
        $waitingCount = $this->store->getWaitingCount($event->id);
        $admittedCount = $this->store->getAdmittedCount($event->id);
        $position = $sessionToken !== null
            ? $this->store->getWaitingPosition($event->id, $sessionToken)
            : null;

        $status = 'inactive';
        $admitted = false;
        $admissionExpiresAt = null;

        if ($session !== null) {
            $status = (string) ($session['status'] ?? 'waiting');
            $admitted = $status === 'admitted' && $this->validateAdmission($event->id, $sessionToken);
            $admissionExpiresAt = $session['admission_expires_at'] ?? null;

            if ($status === 'admitted' && ! $admitted) {
                $status = 'expired';
            }
        } elseif (! $queueActive) {
            $admitted = true;
            $status = 'admitted';
        }

        $estimatedWaitSeconds = $this->estimateWaitSeconds($event->id, $position);

        return [
            'queue_active' => $queueActive,
            'session_token' => $sessionToken,
            'status' => $status,
            'admitted' => $admitted,
            'position' => $position,
            'waiting_ahead' => $position !== null ? max(0, $position - 1) : null,
            'waiting_count' => $waitingCount,
            'admitted_count' => $admittedCount,
            'estimated_wait_seconds' => $estimatedWaitSeconds,
            'admission_expires_at' => $admissionExpiresAt,
            'poll_interval_seconds' => (int) config('waiting_room_module.poll_interval_seconds', 3),
            'admission_token_ttl_seconds' => (int) config('waiting_room_module.admission_token_ttl_seconds', 300),
            'order_ttl_minutes' => $this->getOrderTtlMinutes($event->id),
        ];
    }

    private function estimateWaitSeconds(int $eventId, ?int $position): ?int
    {
        if ($position === null || $position <= 0) {
            return null;
        }

        $batchSize = max(1, (int) config('waiting_room_module.admit_batch_size', 200));
        $interval = max(1, (int) config('waiting_room_module.admit_interval_seconds', 180));
        $batchesAhead = (int) ceil($position / $batchSize);

        return $batchesAhead * $interval;
    }

    private function createAdmittedSession(
        Event $event,
        ?int $userId,
        ?int $ticketTypeId,
        int $quantity,
    ): string {
        $sessionToken = (string) Str::uuid();
        $admittedAt = now();
        $admissionTtl = (int) config('waiting_room_module.admission_token_ttl_seconds', 300);
        $sessionTtl = (int) config('waiting_room_module.session_ttl_seconds', 3600);

        $session = [
            'event_id' => $event->id,
            'event_uuid' => $event->uuid,
            'user_id' => $userId,
            'status' => 'admitted',
            'joined_at' => $admittedAt->toIso8601String(),
            'admitted_at' => $admittedAt->toIso8601String(),
            'admission_expires_at' => $admittedAt->copy()->addSeconds($admissionTtl)->toIso8601String(),
            'ticket_type_id' => $ticketTypeId,
            'quantity' => max(1, $quantity),
        ];

        $this->store->saveSession($sessionToken, $session, $sessionTtl);

        return $sessionToken;
    }
}
