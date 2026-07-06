<?php

namespace Tests\Feature\Organizer;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OrganizerDashboardTest extends TestCase
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
            'name' => 'Dashboard Org',
            'slug' => 'dashboard-org-'.Str::lower(Str::random(6)),
            'email' => 'dashboard@example.com',
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

    public function test_organizer_member_can_get_dashboard_summary(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Dashboard Event',
            'slug' => 'dashboard-event',
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
            ->getJson('/api/v1/organizers/current/dashboard/summary');

        $response->assertOk();
        $response->assertJsonPath('data.totals.events', 1);
        $response->assertJsonPath('data.totals.events_published', 1);
        $response->assertJsonPath('data.totals.orders_completed', 1);
        $response->assertJsonPath('data.totals.revenue_gross', 105000);
        $response->assertJsonPath('data.totals.revenue_net', 100000);
    }

    public function test_organizer_member_can_get_dashboard_trends(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson('/api/v1/organizers/current/dashboard/trends?days=7');

        $response->assertOk();
        $response->assertJsonPath('data.days', 7);
        $response->assertJsonCount(7, 'data.series');
    }

    public function test_dashboard_summary_is_scoped_to_current_organizer(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $otherOrganizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Other Org',
            'slug' => 'other-org-'.Str::lower(Str::random(6)),
            'email' => 'other@example.com',
            'status' => 'active',
        ]);

        Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $otherOrganizer->id,
            'created_by' => $user->id,
            'title' => 'Other Event',
            'slug' => 'other-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson('/api/v1/organizers/current/dashboard/summary');

        $response->assertOk();
        $response->assertJsonPath('data.totals.events', 0);
    }

    public function test_dashboard_requires_organizer_context(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/organizers/current/dashboard/summary');

        $response->assertUnauthorized();
    }

    public function test_organizer_member_can_get_dashboard_insights(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();

        $upcoming = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Upcoming Event',
            'slug' => 'upcoming-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(3),
            'end_at' => now()->addDays(4),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
        ]);

        $draft = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Draft Event',
            'slug' => 'draft-event',
            'status' => EventStatus::DRAFT,
            'visibility' => 'public',
            'start_at' => now()->addWeek(),
            'end_at' => now()->addWeek()->addDay(),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Paid Without Tickets',
            'slug' => 'paid-no-tickets',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(5),
            'end_at' => now()->addDays(6),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-'.strtoupper(Str::random(8)),
            'organizer_id' => $organizer->id,
            'event_id' => $upcoming->id,
            'user_id' => $user->id,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
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
            ->getJson('/api/v1/organizers/current/dashboard/insights');

        $response->assertOk();
        $response->assertJsonPath('data.upcoming_events.0.title', 'Upcoming Event');
        $response->assertJsonPath('data.top_events_by_revenue.0.event.uuid', $upcoming->uuid);
        $response->assertJsonPath('data.top_events_by_revenue.0.revenue_net', 200000);

        $attentionTypes = collect($response->json('data.attention_items'))->pluck('type')->all();
        $this->assertContains('draft_pending_publish', $attentionTypes);
        $this->assertContains('no_ticket_types', $attentionTypes);
    }
}
