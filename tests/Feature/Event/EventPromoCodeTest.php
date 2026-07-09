<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\PromoCode;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventPromoCodeTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Organizer, 2: Event}
     */
    private function createOrganizerContext(): array
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Promo Org',
            'slug' => 'promo-org-'.Str::lower(Str::random(6)),
            'email' => 'promo@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Promo Event',
            'slug' => 'promo-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        return [$user, $organizer, $event];
    }

    public function test_organizer_can_create_event_promo_code(): void
    {
        [$user, $organizer, $event] = $this->createOrganizerContext();
        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->postJson("/api/v1/events/{$event->uuid}/promo-codes", [
                'code' => 'earlybird',
                'description' => 'Early bird discount',
                'discount_type' => 'percentage',
                'discount_value' => 15,
                'usage_limit' => 100,
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.code', 'EARLYBIRD');
        $response->assertJsonPath('data.discount_type', 'percentage');

        $this->assertDatabaseHas('promo_codes', [
            'event_id' => $event->id,
            'code' => 'EARLYBIRD',
        ]);
    }

    public function test_organizer_can_list_event_promo_codes(): void
    {
        [$user, $organizer, $event] = $this->createOrganizerContext();

        PromoCode::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'code' => 'LISTME',
            'discount_type' => 'fixed',
            'discount_value' => 10000,
            'is_active' => true,
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/promo-codes");

        $response->assertOk();
        $response->assertJsonPath('data.0.code', 'LISTME');
    }

    public function test_dashboard_insights_includes_promo_breakdown(): void
    {
        [$user, $organizer, $event] = $this->createOrganizerContext();

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
            'discount_amount' => 15000,
            'promo_code_snapshot' => 'VIP15',
            'total_amount' => 85000,
            'organizer_net_amount' => 85000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/dashboard/insights");

        $response->assertOk();
        $response->assertJsonPath('data.promo_breakdown.0.code', 'VIP15');
        $response->assertJsonPath('data.promo_breakdown.0.usage_count', 1);
        $response->assertJsonPath('data.promo_breakdown.0.discount_total', 15000);
    }
}
