<?php

namespace Tests\Feature\Admin;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_get_dashboard_summary(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Summary Org',
            'slug' => 'summary-org-'.Str::lower(Str::random(6)),
            'email' => 'summary@example.com',
            'status' => OrganizerStatus::ACTIVE,
        ]);

        $owner = User::factory()->create();

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $owner->id,
            'title' => 'Summary Event',
            'slug' => 'summary-event',
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
            'user_id' => $owner->id,
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

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/dashboard/summary');

        $response->assertOk();
        $response->assertJsonPath('data.totals.events', 1);
        $response->assertJsonPath('data.totals.organizers_active', 1);
        $response->assertJsonPath('data.totals.orders_completed', 1);
        $response->assertJsonPath('data.totals.revenue_gross', 105000);
        $response->assertJsonPath('data.totals.platform_fees', 5000);
    }

    public function test_super_admin_can_get_analytics_trends(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/analytics/trends?days=7');

        $response->assertOk();
        $response->assertJsonPath('data.days', 7);
        $response->assertJsonCount(7, 'data.series');
    }

    public function test_non_admin_cannot_get_dashboard_summary(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/dashboard/summary');

        $response->assertForbidden();
    }
}
