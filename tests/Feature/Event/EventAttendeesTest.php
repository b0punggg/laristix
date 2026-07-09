<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Enums\RegistrationStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Models\Ticket;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventAttendeesTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Organizer, 2: Event, 3: Registration}
     */
    private function createEventWithAttendee(): array
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Attendee Organizer',
            'slug' => 'attendee-org-'.Str::lower(Str::random(6)),
            'email' => 'attendee-'.Str::random(6).'@example.com',
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
            'title' => 'Attendee Event',
            'slug' => 'attendee-event-'.Str::lower(Str::random(6)),
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
            'name' => 'Regular',
            'kind' => TicketKind::PAID,
            'price' => 100000,
            'currency' => 'IDR',
            'quantity' => 50,
            'sold_count' => 1,
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
            'buyer_name' => 'Budi Pembeli',
            'buyer_email' => 'budi@example.com',
            'buyer_phone' => '08123456789',
            'status' => OrderStatus::COMPLETED,
            'subtotal' => 100000,
            'total_amount' => 105000,
            'platform_fee_total' => 5000,
            'organizer_net_amount' => 100000,
            'paid_at' => now(),
            'completed_at' => now(),
            'metadata' => [
                'buyer_profile' => [
                    'id_number' => '3201010101010001',
                ],
            ],
        ]);

        $orderItem = OrderItem::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_type_name' => 'Regular',
            'unit_price' => 100000,
            'quantity' => 1,
            'subtotal' => 100000,
        ]);

        $registration = Registration::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'order_id' => $order->id,
            'order_item_id' => $orderItem->id,
            'ticket_type_id' => $ticketType->id,
            'seat_index' => 1,
            'attendee_name' => 'Budi Pembeli',
            'attendee_email' => 'budi@example.com',
            'attendee_phone' => '08123456789',
            'metadata' => ['id_number' => '3201010101010001'],
            'status' => RegistrationStatus::CONFIRMED,
            'confirmed_at' => now(),
        ]);

        $qrToken = Str::random(64);

        Ticket::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'registration_id' => $registration->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_code' => 'TKT-'.strtoupper(Str::random(6)),
            'qr_token' => $qrToken,
            'qr_token_hash' => hash('sha256', $qrToken),
            'status' => 'valid',
            'issued_at' => now(),
        ]);

        return [$user, $organizer, $event, $registration];
    }

    public function test_organizer_can_list_event_attendees(): void
    {
        [$user, $organizer, $event, $registration] = $this->createEventWithAttendee();
        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/attendees");

        $response->assertOk();
        $response->assertJsonPath('meta.total', 1);
        $response->assertJsonPath('data.0.uuid', $registration->uuid);
        $response->assertJsonPath('data.0.attendee_name', 'Budi Pembeli');
        $response->assertJsonPath('data.0.order.buyer_email', 'budi@example.com');
        $response->assertJsonPath('data.0.ticket_code', fn ($value) => is_string($value) && $value !== '');
    }

    public function test_attendees_can_be_searched_by_buyer_email(): void
    {
        [$user, $organizer, $event] = $this->createEventWithAttendee();
        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/attendees?search=budi@example.com");

        $response->assertOk();
        $response->assertJsonPath('meta.total', 1);
    }

    public function test_organizer_can_view_event_order_detail(): void
    {
        [$user, $organizer, $event, $registration] = $this->createEventWithAttendee();
        Sanctum::actingAs($user);

        $orderUuid = $registration->order_id
            ? Order::withoutOrganizerScope()->find($registration->order_id)?->uuid
            : null;

        $this->assertNotNull($orderUuid);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/orders/{$orderUuid}");

        $response->assertOk();
        $response->assertJsonPath('data.order_number', fn ($value) => is_string($value) && $value !== '');
        $response->assertJsonPath('data.buyer_name', 'Budi Pembeli');
        $response->assertJsonPath('data.transaction_type', 'paid');
        $response->assertJsonPath('data.invoice_status_label', 'Lunas');
        $response->assertJsonCount(1, 'data.tickets');
        $response->assertJsonPath('data.tickets.0.attendee_name', 'Budi Pembeli');
    }

    public function test_scanner_cannot_access_event_attendees(): void
    {
        [$user, $organizer, $event] = $this->createEventWithAttendee();

        $scanner = User::factory()->create();

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $scanner->id,
            'role' => 'scanner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        Sanctum::actingAs($scanner);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/attendees");

        $response->assertForbidden();
    }
}
