<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventDashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Organizer}
     */
    private function createOrganizerOwner(): array
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Event Dashboard Org',
            'slug' => 'event-dashboard-org-'.Str::lower(Str::random(6)),
            'email' => 'event-dashboard@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        return [$user, $organizer];
    }

    public function test_organizer_member_can_get_event_dashboard_summary(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Target Event',
            'slug' => 'target-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'user_id' => $user->id,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
            'status' => OrderStatus::COMPLETED,
            'subtotal' => 100000,
            'total_amount' => 105000,
            'platform_fee_total' => 5000,
            'organizer_net_amount' => 100000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/dashboard/summary");

        $response->assertOk();
        $response->assertJsonPath('data.event.uuid', $event->uuid);
        $response->assertJsonPath('data.event.title', 'Target Event');
        $response->assertJsonPath('data.totals.orders_completed', 1);
        $response->assertJsonPath('data.totals.revenue_gross', 105000);
        $response->assertJsonPath('data.totals.revenue_net', 100000);
    }

    public function test_event_dashboard_summary_is_scoped_to_single_event(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $targetEvent = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Target Event',
            'slug' => 'target-event-scoped',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        $otherEvent = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Other Event',
            'slug' => 'other-event-scoped',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'organizer_id' => $organizer->id,
            'event_id' => $targetEvent->id,
            'user_id' => $user->id,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
            'status' => OrderStatus::COMPLETED,
            'subtotal' => 50000,
            'total_amount' => 52500,
            'platform_fee_total' => 2500,
            'organizer_net_amount' => 50000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'organizer_id' => $organizer->id,
            'event_id' => $otherEvent->id,
            'user_id' => $user->id,
            'buyer_name' => 'Buyer 2',
            'buyer_email' => 'buyer2@example.com',
            'status' => OrderStatus::COMPLETED,
            'subtotal' => 200000,
            'total_amount' => 210000,
            'platform_fee_total' => 10000,
            'organizer_net_amount' => 200000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$targetEvent->uuid}/dashboard/summary");

        $response->assertOk();
        $response->assertJsonPath('data.totals.orders_completed', 1);
        $response->assertJsonPath('data.totals.revenue_net', 50000);
    }

    public function test_organizer_member_can_get_event_dashboard_trends(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Trend Event',
            'slug' => 'trend-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/dashboard/trends?days=7");

        $response->assertOk();
        $response->assertJsonPath('data.days', 7);
        $response->assertJsonCount(7, 'data.series');
    }

    public function test_event_dashboard_requires_organizer_context(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/events/'.Str::uuid().'/dashboard/summary');

        $response->assertUnauthorized();
    }

    public function test_event_dashboard_returns_not_found_for_other_organizer_event(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $otherOrganizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Foreign Org',
            'slug' => 'foreign-org-'.Str::lower(Str::random(6)),
            'email' => 'foreign@example.com',
            'status' => 'active',
        ]);

        $foreignEvent = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $otherOrganizer->id,
            'created_by' => $user->id,
            'title' => 'Foreign Event',
            'slug' => 'foreign-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$foreignEvent->uuid}/dashboard/summary");

        $response->assertNotFound();
    }

    public function test_organizer_member_can_get_event_dashboard_insights(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Insights Event',
            'slug' => 'insights-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => 'VIP',
            'kind' => TicketKind::PAID,
            'price' => 150000,
            'currency' => 'IDR',
            'quantity' => 100,
            'sold_count' => 2,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $order = Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'user_id' => $user->id,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
            'status' => OrderStatus::COMPLETED,
            'subtotal' => 300000,
            'total_amount' => 315000,
            'platform_fee_total' => 15000,
            'organizer_net_amount' => 300000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        OrderItem::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_type_name' => 'VIP',
            'unit_price' => 150000,
            'quantity' => 2,
            'subtotal' => 300000,
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/dashboard/insights");

        $response->assertOk();
        $response->assertJsonPath('data.ticket_breakdown.0.name', 'VIP');
        $response->assertJsonPath('data.ticket_breakdown.0.sold', 2);
        $response->assertJsonPath('data.recent_orders.0.order_number', $order->order_number);
        $response->assertJsonPath('data.recent_orders.0.buyer_name', 'Buyer');
    }
}
