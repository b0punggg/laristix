<?php

namespace Tests\Feature\WaitingRoom;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use App\Modules\WaitingRoom\Contracts\QueueStoreInterface;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use App\Modules\WaitingRoom\Repositories\ArrayQueueStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WaitingRoomTest extends TestCase
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
            'waiting_room_module.admit_batch_size' => 2,
            'waiting_room_module.admit_interval_seconds' => 0,
            'waiting_room_module.order_ttl_high_demand_minutes' => 12,
            'waiting_room_module.order_ttl_normal_minutes' => 30,
        ]);
    }

    /**
     * @return array{0: User, 1: Event, 2: TicketType}
     */
    private function createPublishedEventWithTicket(): array
    {
        $organizerUser = User::factory()->create();
        $buyer = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Queue Organizer',
            'slug' => 'queue-org-'.Str::lower(Str::random(6)),
            'email' => 'queue@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $organizerUser->id,
            'role' => 'owner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $organizerUser->id,
            'title' => 'Queue Event',
            'slug' => 'queue-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(7),
            'end_at' => now()->addDays(8),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'published_at' => now(),
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => 'Regular',
            'kind' => TicketKind::FREE,
            'price' => 0,
            'currency' => 'IDR',
            'quantity' => 50,
            'sold_count' => 0,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        return [$buyer, $event, $ticketType];
    }

    private function activateQueueForEvent(Event $event): void
    {
        /** @var QueueStoreInterface $store */
        $store = app(QueueStoreInterface::class);

        for ($i = 0; $i < 6; $i++) {
            $store->incrementTraffic($event->id, 10);
        }

        app(WaitingRoomServiceInterface::class)->activateQueueIfNeeded($event->id);
    }

    public function test_join_returns_admitted_when_queue_is_inactive(): void
    {
        [, $event, $ticketType] = $this->createPublishedEventWithTicket();

        $response = $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.queue_active', false);
        $response->assertJsonPath('data.admitted', true);
        $response->assertJsonPath('data.status', 'admitted');
    }

    public function test_checkout_is_blocked_when_queue_active_without_admission(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket();
        $this->activateQueueForEvent($event);
        Sanctum::actingAs($buyer);

        $response = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Queue Buyer',
            'buyer_email' => 'queue-buyer@example.com',
        ]);

        $response->assertForbidden();
        $response->assertJsonPath('error_code', 'WAITING_ROOM_REQUIRED');
    }

    public function test_promote_command_admits_waiting_users(): void
    {
        [, $event] = $this->createPublishedEventWithTicket();
        $this->activateQueueForEvent($event);

        $first = $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");
        $second = $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");
        $third = $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");

        $first->assertJsonPath('data.status', 'waiting');
        $second->assertJsonPath('data.status', 'waiting');
        $third->assertJsonPath('data.status', 'waiting');

        $this->artisan('waiting-room:promote')->assertSuccessful();

        $firstToken = $first->json('data.session_token');
        $status = $this->getJson("/api/v1/public/events/{$event->uuid}/queue/status?session_token={$firstToken}");
        $status->assertOk();
        $status->assertJsonPath('data.admitted', true);
    }

    public function test_admitted_user_can_checkout_with_queue_session_header(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket();
        $this->activateQueueForEvent($event);

        $join = $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");
        $sessionToken = $join->json('data.session_token');

        $this->artisan('waiting-room:promote')->assertSuccessful();

        Sanctum::actingAs($buyer);

        $response = $this->postJson(
            "/api/v1/public/events/{$event->uuid}/checkout",
            [
                'ticket_type_id' => $ticketType->id,
                'quantity' => 1,
                'buyer_name' => 'Admitted Buyer',
                'buyer_email' => 'admitted@example.com',
            ],
            ['X-Queue-Session' => $sessionToken],
        );

        $response->assertCreated();
        $response->assertJsonPath('data.order.status', OrderStatus::COMPLETED);
    }

    public function test_checkout_uses_shorter_ttl_when_queue_is_active(): void
    {
        config([
            'payment_module.midtrans.server_key' => 'SB-Mid-server-test',
            'payment_module.midtrans.client_key' => 'SB-Mid-client-test',
        ]);

        Http::fake([
            'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'token' => 'snap-token-test',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-test',
            ], 201),
        ]);

        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket();
        $event->fill(['is_free' => false])->save();
        $ticketType->fill(['kind' => TicketKind::PAID, 'price' => 100000])->save();

        $organizer = $event->organizer;
        $organizer->fill([
            'settings' => [
                'compliance' => [
                    'type' => 'individual',
                    'legal_name' => 'Queue Organizer',
                    'ktp_number' => '3201010101010001',
                    'status' => 'verified',
                    'verified_at' => now()->toIso8601String(),
                ],
            ],
        ])->save();

        $this->activateQueueForEvent($event);

        $join = $this->postJson("/api/v1/public/events/{$event->uuid}/queue/join");
        $sessionToken = $join->json('data.session_token');
        $this->artisan('waiting-room:promote')->assertSuccessful();

        Sanctum::actingAs($buyer);

        $response = $this->postJson(
            "/api/v1/public/events/{$event->uuid}/checkout",
            [
                'ticket_type_id' => $ticketType->id,
                'quantity' => 1,
                'buyer_name' => 'TTL Buyer',
                'buyer_email' => 'ttl@example.com',
            ],
            ['X-Queue-Session' => $sessionToken],
        );

        $response->assertCreated();

        $expiresAt = $response->json('data.order.expires_at');
        $this->assertNotNull($expiresAt);
        $this->assertTrue(now()->addMinutes(11)->lessThan($expiresAt));
        $this->assertTrue(now()->addMinutes(13)->greaterThan($expiresAt));
    }
}
