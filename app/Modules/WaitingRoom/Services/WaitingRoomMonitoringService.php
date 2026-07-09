<?php

namespace App\Modules\WaitingRoom\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;
use App\Modules\WaitingRoom\Contracts\WaitingRoomMonitoringServiceInterface;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use App\Modules\WaitingRoom\Exceptions\WaitingRoomException;
use Illuminate\Support\Carbon;

class WaitingRoomMonitoringService implements WaitingRoomMonitoringServiceInterface
{
    public function __construct(
        private readonly QueueStoreInterface $store,
        private readonly WaitingRoomServiceInterface $waitingRoom,
    ) {}

    public function listQueues(?string $search = null, bool $activeOnly = false): array
    {
        $windowSeconds = (int) config('waiting_room_module.traffic.window_seconds', 10);
        $threshold = (int) config('waiting_room_module.traffic.threshold', 80);
        $queues = [];

        foreach ($this->store->getActiveEventIds() as $eventId) {
            $snapshot = $this->buildSnapshot((int) $eventId, $windowSeconds, $threshold);

            if ($snapshot === null) {
                continue;
            }

            if ($activeOnly && ! $snapshot['queue_active']) {
                continue;
            }

            if (! $this->matchesSearch($snapshot, $search)) {
                continue;
            }

            if (! $this->hasMeaningfulActivity($snapshot)) {
                continue;
            }

            $queues[] = $snapshot;
        }

        usort($queues, function (array $left, array $right): int {
            if ($left['queue_active'] !== $right['queue_active']) {
                return $left['queue_active'] ? -1 : 1;
            }

            if ($left['waiting_count'] !== $right['waiting_count']) {
                return $right['waiting_count'] <=> $left['waiting_count'];
            }

            return $right['traffic_count'] <=> $left['traffic_count'];
        });

        return [
            'summary' => $this->buildSummary($queues),
            'queues' => $queues,
            'config' => $this->configSnapshot($windowSeconds, $threshold),
        ];
    }

    public function showEvent(string $eventUuid): array
    {
        $event = $this->resolveEvent($eventUuid);
        $windowSeconds = (int) config('waiting_room_module.traffic.window_seconds', 10);
        $threshold = (int) config('waiting_room_module.traffic.threshold', 80);
        $snapshot = $this->buildSnapshot($event->id, $windowSeconds, $threshold);

        if ($snapshot === null) {
            throw WaitingRoomException::invalidSession('Event queue metrics are unavailable.');
        }

        return [
            'queue' => $snapshot,
            'config' => $this->configSnapshot($windowSeconds, $threshold),
        ];
    }

    public function promoteEvent(string $eventUuid): int
    {
        $event = $this->resolveEvent($eventUuid);

        return $this->waitingRoom->promoteEvent($event->id);
    }

    public function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    /**
     * @return array<string, mixed>|null
     */
    private function buildSnapshot(int $eventId, int $windowSeconds, int $threshold): ?array
    {
        $event = Event::withoutOrganizerScope()
            ->with('organizer:id,uuid,name,slug')
            ->find($eventId);

        if ($event === null) {
            return null;
        }

        $waitingCount = $this->store->getWaitingCount($eventId);
        $admittedCount = $this->store->getAdmittedCount($eventId);
        $trafficCount = $this->store->getTrafficCount($eventId, $windowSeconds);
        $promotedTotal = $this->store->getPromotedTotal($eventId);
        $queueActive = $this->store->isQueueActive($eventId);
        $activatedAt = $this->store->getQueueActivatedAt($eventId);
        $lastPromoteAt = $this->store->getLastPromoteAt($eventId);
        $queueSize = $waitingCount + $admittedCount;

        $admissionRatePercent = $queueSize > 0
            ? round(($admittedCount / $queueSize) * 100, 1)
            : 0.0;

        $admittedRatePercent = ($promotedTotal + $waitingCount) > 0
            ? round(($promotedTotal / ($promotedTotal + $waitingCount)) * 100, 1)
            : 0.0;

        $trafficPressurePercent = $threshold > 0
            ? min(100, round(($trafficCount / $threshold) * 100, 1))
            : 0.0;

        return [
            'event' => [
                'uuid' => $event->uuid,
                'title' => $event->title,
                'status' => $event->status,
                'start_at' => $event->start_at?->toIso8601String(),
                'organizer' => $event->organizer ? [
                    'uuid' => $event->organizer->uuid,
                    'name' => $event->organizer->name,
                    'slug' => $event->organizer->slug,
                ] : null,
            ],
            'queue_active' => $queueActive,
            'waiting_count' => $waitingCount,
            'admitted_count' => $admittedCount,
            'promoted_total' => $promotedTotal,
            'traffic_count' => $trafficCount,
            'traffic_threshold' => $threshold,
            'traffic_window_seconds' => $windowSeconds,
            'traffic_pressure_percent' => $trafficPressurePercent,
            'admission_slot_rate_percent' => $admissionRatePercent,
            'admitted_rate_percent' => $admittedRatePercent,
            'queue_activated_at' => $activatedAt !== null
                ? Carbon::createFromTimestamp($activatedAt)->toIso8601String()
                : null,
            'last_promote_at' => $lastPromoteAt !== null
                ? Carbon::createFromTimestamp($lastPromoteAt)->toIso8601String()
                : null,
            'order_ttl_minutes' => $this->waitingRoom->getOrderTtlMinutes($eventId),
            'waiting_room_enabled' => (bool) config('waiting_room_module.enabled', true),
        ];
    }

    /**
     * @param  list<array<string, mixed>>  $queues
     * @return array<string, int|float>
     */
    private function buildSummary(array $queues): array
    {
        $activeQueues = array_filter($queues, static fn (array $queue): bool => (bool) $queue['queue_active']);

        return [
            'tracked_events' => count($queues),
            'active_queues' => count($activeQueues),
            'total_waiting' => array_sum(array_column($queues, 'waiting_count')),
            'total_admitted' => array_sum(array_column($queues, 'admitted_count')),
            'total_promoted' => array_sum(array_column($queues, 'promoted_total')),
            'avg_admitted_rate_percent' => count($queues) > 0
                ? round(array_sum(array_column($queues, 'admitted_rate_percent')) / count($queues), 1)
                : 0.0,
            'max_traffic_pressure_percent' => count($queues) > 0
                ? max(array_column($queues, 'traffic_pressure_percent'))
                : 0.0,
        ];
    }

    /**
     * @return array<string, int|bool>
     */
    private function configSnapshot(int $windowSeconds, int $threshold): array
    {
        return [
            'enabled' => (bool) config('waiting_room_module.enabled', true),
            'admit_batch_size' => (int) config('waiting_room_module.admit_batch_size', 200),
            'admit_interval_seconds' => (int) config('waiting_room_module.admit_interval_seconds', 180),
            'admission_token_ttl_seconds' => (int) config('waiting_room_module.admission_token_ttl_seconds', 300),
            'traffic_threshold' => $threshold,
            'traffic_window_seconds' => $windowSeconds,
            'order_ttl_high_demand_minutes' => (int) config('waiting_room_module.order_ttl_high_demand_minutes', 12),
        ];
    }

    /**
     * @param  array<string, mixed>  $snapshot
     */
    private function hasMeaningfulActivity(array $snapshot): bool
    {
        return (bool) $snapshot['queue_active']
            || (int) $snapshot['waiting_count'] > 0
            || (int) $snapshot['admitted_count'] > 0
            || (int) $snapshot['traffic_count'] > 0
            || (int) $snapshot['promoted_total'] > 0;
    }

    /**
     * @param  array<string, mixed>  $snapshot
     */
    private function matchesSearch(array $snapshot, ?string $search): bool
    {
        if ($search === null || trim($search) === '') {
            return true;
        }

        $keyword = mb_strtolower(trim($search));
        /** @var array<string, mixed> $event */
        $event = $snapshot['event'];
        /** @var array<string, mixed>|null $organizer */
        $organizer = $event['organizer'] ?? null;

        $haystack = mb_strtolower(implode(' ', array_filter([
            (string) ($event['title'] ?? ''),
            (string) ($event['uuid'] ?? ''),
            (string) ($organizer['name'] ?? ''),
            (string) ($organizer['slug'] ?? ''),
        ])));

        return str_contains($haystack, $keyword);
    }

    private function resolveEvent(string $eventUuid): Event
    {
        $event = Event::withoutOrganizerScope()
            ->where('uuid', $eventUuid)
            ->first();

        if ($event === null) {
            throw WaitingRoomException::invalidSession('Event not found.');
        }

        return $event;
    }
}
