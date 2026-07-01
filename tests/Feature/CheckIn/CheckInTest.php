<?php

namespace Tests\Feature\CheckIn;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Enums\TicketStatus;
use App\Modules\Order\Models\Order;
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

class CheckInTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Event, 2: Ticket}
     */
    private function createEventWithTicket(): array
    {
        $owner = User::factory()->create(['email_verified_at' => now()]);
        $scanner = User::factory()->create(['email_verified_at' => now()]);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'CheckIn Organizer',
            'slug' => 'checkin-org-'.Str::lower(Str::random(6)),
            'email' => 'checkin@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $owner->id,
            'role' => 'owner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $scanner->id,
            'role' => 'scanner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $owner->id,
            'title' => 'CheckIn Event',
            'slug' => 'checkin-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'published_at' => now(),
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => 'GA',
            'kind' => TicketKind::FREE,
            'price' => 0,
            'currency' => 'IDR',
            'quantity' => 100,
            'sold_count' => 1,
            'reserved_count' => 0,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $buyer = User::factory()->create(['email_verified_at' => now()]);

        $order = Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'user_id' => $buyer->id,
            'order_number' => 'ORD-CHK-'.Str::upper(Str::random(6)),
            'status' => OrderStatus::COMPLETED,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
            'currency' => 'IDR',
            'subtotal' => 0,
            'total_amount' => 0,
            'completed_at' => now(),
        ]);

        $orderItem = \App\Modules\Order\Models\OrderItem::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_type_name' => $ticketType->name,
            'unit_price' => 0,
            'quantity' => 1,
            'subtotal' => 0,
        ]);

        $registration = Registration::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'order_id' => $order->id,
            'order_item_id' => $orderItem->id,
            'ticket_type_id' => $ticketType->id,
            'seat_index' => 1,
            'attendee_name' => 'Buyer',
            'attendee_email' => 'buyer@example.com',
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        $qrToken = Str::random(64);

        $ticket = Ticket::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'registration_id' => $registration->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_code' => 'ABC123XYZ0',
            'qr_token' => $qrToken,
            'qr_token_hash' => hash('sha256', $qrToken),
            'status' => TicketStatus::VALID,
            'issued_at' => now(),
        ]);

        return [$scanner, $event, $ticket];
    }

    public function test_scanner_can_check_in_by_qr_token(): void
    {
        [$scanner, $event, $ticket] = $this->createEventWithTicket();

        Sanctum::actingAs($scanner);

        $this->withHeader('X-Organizer-Id', (string) $event->organizer_id)
            ->postJson("/api/v1/events/{$event->uuid}/check-ins/scan", [
                'qr_token' => 'LX:'.$ticket->qr_token,
            ])
            ->assertOk()
            ->assertJsonPath('data.method', 'qr_scan')
            ->assertJsonPath('data.ticket.ticket_code', 'ABC123XYZ0');

        $this->assertDatabaseHas('check_ins', [
            'ticket_id' => $ticket->id,
            'event_id' => $event->id,
            'method' => 'qr_scan',
        ]);

        $ticket->refresh();
        $this->assertSame(TicketStatus::USED, $ticket->status);
        $this->assertNotNull($ticket->checked_in_at);
    }

    public function test_manual_check_in_by_ticket_code(): void
    {
        [$scanner, $event, $ticket] = $this->createEventWithTicket();

        Sanctum::actingAs($scanner);

        $this->withHeader('X-Organizer-Id', (string) $event->organizer_id)
            ->postJson("/api/v1/events/{$event->uuid}/check-ins/manual", [
                'ticket_code' => $ticket->ticket_code,
            ])
            ->assertOk()
            ->assertJsonPath('data.method', 'manual');
    }

    public function test_duplicate_check_in_is_rejected(): void
    {
        [$scanner, $event, $ticket] = $this->createEventWithTicket();

        Sanctum::actingAs($scanner);

        $headers = ['X-Organizer-Id' => (string) $event->organizer_id];

        $this->withHeaders($headers)
            ->postJson("/api/v1/events/{$event->uuid}/check-ins/scan", [
                'qr_token' => $ticket->qr_token,
            ])
            ->assertOk();

        $this->withHeaders($headers)
            ->postJson("/api/v1/events/{$event->uuid}/check-ins/scan", [
                'qr_token' => $ticket->qr_token,
            ])
            ->assertStatus(409);
    }

    public function test_attendance_stats_endpoint(): void
    {
        [$scanner, $event, $ticket] = $this->createEventWithTicket();

        Sanctum::actingAs($scanner);

        $this->withHeader('X-Organizer-Id', (string) $event->organizer_id)
            ->postJson("/api/v1/events/{$event->uuid}/check-ins/scan", [
                'qr_token' => $ticket->qr_token,
            ])
            ->assertOk();

        $this->withHeader('X-Organizer-Id', (string) $event->organizer_id)
            ->getJson("/api/v1/events/{$event->uuid}/check-ins/stats")
            ->assertOk()
            ->assertJsonPath('data.checked_in', 1)
            ->assertJsonPath('data.total_tickets', 1);
    }
}
