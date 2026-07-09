<?php

namespace Tests\Feature\Admin;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;
use App\Modules\WaitingRoom\Repositories\ArrayQueueStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminWaitingRoomTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        ArrayQueueStore::reset();
        config([
            'waiting_room_module.enabled' => true,
            'waiting_room_module.driver' => 'array',
            'waiting_room_module.traffic.threshold' => 5,
            'waiting_room_module.traffic.window_seconds' => 10,
        ]);
    }

    private function createSuperAdmin(): User
    {
        return User::factory()->create([
            'platform_role' => 'super_admin',
            'status' => 'active',
        ]);
    }

    private function createPublishedEvent(): Event
    {
        $owner = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Queue Monitor Org',
            'slug' => 'queue-monitor-org-'.Str::lower(Str::random(6)),
            'email' => 'queue-monitor@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        return Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $owner->id,
            'title' => 'Queue Monitor Event',
            'slug' => 'queue-monitor-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(7),
            'end_at' => now()->addDays(8),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'published_at' => now(),
        ]);
    }

    public function test_super_admin_can_list_waiting_room_queues(): void
    {
        $admin = $this->createSuperAdmin();
        $event = $this->createPublishedEvent();

        /** @var QueueStoreInterface $store */
        $store = app(QueueStoreInterface::class);
        $store->setQueueActive($event->id, true);
        $store->addToWaiting($event->id, 'session-1', microtime(true));
        $store->addToAdmitted($event->id, 'session-2', microtime(true));
        $store->incrementPromotedTotal($event->id, 3);
        $store->incrementTraffic($event->id, 10);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/waiting-room/queues');

        $response->assertOk();
        $response->assertJsonPath('data.summary.active_queues', 1);
        $response->assertJsonPath('data.queues.0.event.uuid', $event->uuid);
        $response->assertJsonPath('data.queues.0.waiting_count', 1);
        $response->assertJsonPath('data.queues.0.admitted_count', 1);
        $response->assertJsonPath('data.queues.0.promoted_total', 3);
    }

    public function test_super_admin_can_promote_waiting_room_event(): void
    {
        $admin = $this->createSuperAdmin();
        $event = $this->createPublishedEvent();

        config([
            'waiting_room_module.admit_batch_size' => 2,
            'waiting_room_module.admit_interval_seconds' => 0,
        ]);

        /** @var QueueStoreInterface $store */
        $store = app(QueueStoreInterface::class);
        for ($i = 0; $i < 6; $i++) {
            $store->incrementTraffic($event->id, 10);
        }
        app(\App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface::class)
            ->activateQueueIfNeeded($event->id);

        $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");
        $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");
        $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");

        Sanctum::actingAs($admin);

        $response = $this->postJson("/api/v1/admin/waiting-room/events/{$event->uuid}/promote");

        $response->assertOk();
        $response->assertJsonPath('data.promoted_count', 2);
    }

    public function test_non_admin_cannot_access_waiting_room_monitoring(): void
    {
        $user = User::factory()->create(['platform_role' => 'user']);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/admin/waiting-room/queues')->assertForbidden();
    }
}
