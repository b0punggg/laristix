<?php

namespace Tests\Feature\Order;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Notifications\TicketsIssuedNotification;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class UserOrdersTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Event, 2: TicketType}
     */
    private function createPublishedEventWithTicket(): array
    {
        $organizerUser = User::factory()->create();

        $buyer = User::factory()->create([
            'name' => 'Ticket Buyer',
            'email' => 'buyer@example.com',
        ]);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Orders Organizer',
            'slug' => 'orders-org-'.Str::lower(Str::random(6)),
            'email' => 'orders@example.com',
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
            'title' => 'My Tickets Event',
            'slug' => 'my-tickets-event',
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
            'name' => 'Free Pass',
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

    public function test_guest_cannot_list_orders(): void
    {
        $response = $this->getJson('/api/v1/public/orders');

        $response->assertUnauthorized();
    }

    public function test_user_can_list_own_orders(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket();
        Sanctum::actingAs($buyer);

        $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Buyer One',
            'buyer_email' => 'buyer@example.com',
        ])->assertCreated();

        $response = $this->getJson('/api/v1/public/orders');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.status', OrderStatus::COMPLETED);
        $response->assertJsonPath('data.0.event.title', 'My Tickets Event');
        $response->assertJsonStructure([
            'data' => [
                [
                    'uuid',
                    'order_number',
                    'status',
                    'event' => ['uuid', 'title', 'slug'],
                    'registrations' => [
                        ['uuid', 'ticket' => ['ticket_code']],
                    ],
                ],
            ],
            'meta' => ['current_page', 'last_page', 'per_page', 'total'],
        ]);
    }

    public function test_user_orders_list_excludes_other_users_orders(): void
    {
        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket();
        Sanctum::actingAs($buyer);

        $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Buyer One',
            'buyer_email' => 'buyer@example.com',
        ])->assertCreated();

        $otherUser = User::factory()->create();
        Sanctum::actingAs($otherUser);

        $response = $this->getJson('/api/v1/public/orders');

        $response->assertOk();
        $response->assertJsonCount(0, 'data');
        $response->assertJsonPath('meta.total', 0);
    }

    public function test_fulfillment_sends_tickets_email_once(): void
    {
        Notification::fake();

        [$buyer, $event, $ticketType] = $this->createPublishedEventWithTicket();
        Sanctum::actingAs($buyer);

        $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Buyer One',
            'buyer_email' => 'buyer@example.com',
        ])->assertCreated();

        Notification::assertSentOnDemand(
            TicketsIssuedNotification::class,
            function ($notification, $channels, $notifiable) {
                return ($notifiable->routes['mail'] ?? null) === 'buyer@example.com';
            }
        );

        Notification::assertSentOnDemandTimes(TicketsIssuedNotification::class, 1);

        $orderUuid = $this->getJson('/api/v1/public/orders')->json('data.0.uuid');

        $this->postJson("/api/v1/public/orders/{$orderUuid}/validate-payment")
            ->assertOk();

        Notification::assertSentOnDemandTimes(TicketsIssuedNotification::class, 1);
    }
}
