<?php

namespace Tests\Feature\Order;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Ticket;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Event, 2: TicketType}
     */
    private function createPublishedEventWithTicket(bool $free = true): array
    {
        $organizerUser = User::factory()->create();

        $buyer = User::factory()->create([
            'name' => 'Checkout Buyer',
            'email' => 'buyer@example.com',
        ]);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Checkout Organizer',
            'slug' => 'checkout-org-'.Str::lower(Str::random(6)),
            'email' => 'checkout@example.com',
            'status' => 'active',
            'settings' => $free ? null : [
                'compliance' => [
                    'type' => 'individual',
                    'legal_name' => 'Checkout Organizer',
                    'ktp_number' => '3201010101010001',
                    'status' => 'verified',
                    'verified_at' => now()->toIso8601String(),
                ],
            ],
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
            'title' => 'Checkout Event',
            'slug' => 'checkout-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(7),
            'end_at' => now()->addDays(8),
            'timezone' => 'Asia/Jakarta',
            'is_free' => $free,
            'published_at' => now(),
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => $free ? 'Free Pass' : 'Regular',
            'kind' => $free ? TicketKind::FREE : TicketKind::PAID,
            'price' => $free ? 0 : 100000,
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

    public function test_guest_cannot_checkout(): void
    {
        [, $event, $ticketType] = $this->createPublishedEventWithTicket(true);

        $response = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Guest',
            'buyer_email' => 'guest@example.com',
        ]);

        $response->assertUnauthorized();
    }

    public function test_free_checkout_completes_and_issues_tickets(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket(true);
        Sanctum::actingAs($buyer);

        $response = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 2,
            'buyer_name' => 'Budi Santoso',
            'buyer_email' => 'budi@example.com',
            'buyer_phone' => '08123456789',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.order.status', OrderStatus::COMPLETED);
        $response->assertJsonPath('data.snap_token', null);
        $response->assertJsonCount(2, 'data.order.registrations');

        $orderUuid = $response->json('data.order.uuid');
        $this->assertDatabaseHas('orders', [
            'uuid' => $orderUuid,
            'status' => OrderStatus::COMPLETED,
            'user_id' => $buyer->id,
        ]);

        $this->assertSame(2, Ticket::withoutOrganizerScope()->count());
        $ticketType->refresh();
        $this->assertSame(2, $ticketType->sold_count);
        $this->assertSame(0, $ticketType->reserved_count);
    }

    public function test_paid_checkout_returns_snap_token(): void
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

        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket(false);
        Sanctum::actingAs($buyer);

        $response = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Ani Wijaya',
            'buyer_email' => 'ani@example.com',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.order.status', OrderStatus::AWAITING_PAYMENT);
        $response->assertJsonPath('data.snap_token', 'snap-token-test');
        $response->assertJsonPath('data.client_key', 'SB-Mid-client-test');
        $response->assertJsonPath('data.order.payment.status', PaymentStatus::PENDING);

        $ticketType->refresh();
        $this->assertSame(1, $ticketType->reserved_count);
        $this->assertSame(0, $ticketType->sold_count);
    }

    public function test_authenticated_user_can_view_own_order_status(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket(true);
        Sanctum::actingAs($buyer);

        $checkout = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Viewer',
            'buyer_email' => 'viewer@example.com',
        ]);

        $uuid = $checkout->json('data.order.uuid');

        $response = $this->getJson("/api/v1/public/orders/{$uuid}");
        $response->assertOk();
        $response->assertJsonPath('data.status', OrderStatus::COMPLETED);
    }

    public function test_user_cannot_view_another_users_order(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket(true);
        Sanctum::actingAs($buyer);

        $checkout = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Viewer',
            'buyer_email' => 'viewer@example.com',
        ]);

        $uuid = $checkout->json('data.order.uuid');

        $otherUser = User::factory()->create();
        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/v1/public/orders/{$uuid}");
        $response->assertNotFound();
    }
}
