<?php

namespace Tests\Feature\Organizer;

use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Enums\TicketStatus;
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

class OrganizerScannerDashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Organizer, 2: Event}
     */
    private function createScannerContext(): array
    {
        $owner = User::factory()->create();
        $scanner = User::factory()->create(['email_verified_at' => now()]);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Scanner Org',
            'slug' => 'scanner-org-'.Str::lower(Str::random(6)),
            'email' => 'scanner-org@example.com',
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
            'title' => 'Scanner Event',
            'slug' => 'scanner-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->subHour(),
            'end_at' => now()->addDay(),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
        ]);

        return [$scanner, $organizer, $event];
    }

    public function test_scanner_can_get_personal_scan_summary(): void
    {
        [$scanner, $organizer, $event] = $this->createScannerContext();

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
            'order_number' => 'ORD-SCN-'.Str::upper(Str::random(6)),
            'status' => OrderStatus::COMPLETED,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
            'currency' => 'IDR',
            'subtotal' => 0,
            'total_amount' => 0,
            'completed_at' => now(),
        ]);

        $orderItem = OrderItem::withoutOrganizerScope()->create([
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
            'ticket_code' => 'SCN123XYZ0',
            'qr_token' => $qrToken,
            'qr_token_hash' => hash('sha256', $qrToken),
            'status' => TicketStatus::USED,
            'issued_at' => now(),
        ]);

        CheckIn::query()->create([
            'ticket_id' => $ticket->id,
            'registration_id' => $registration->id,
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'scanned_by' => $scanner->id,
            'method' => 'qr_scan',
            'checked_in_at' => now(),
        ]);

        Sanctum::actingAs($scanner);

        $response = $this->getJson('/api/v1/organizers/current/dashboard/scanner-summary', [
            'X-Organizer-Id' => (string) $organizer->id,
        ]);

        $response->assertOk()
            ->assertJsonPath('data.today.scans', 1)
            ->assertJsonCount(1, 'data.events_today')
            ->assertJsonPath('data.events_today.0.scans_today', 1);
    }

    public function test_scanner_cannot_access_full_dashboard_summary(): void
    {
        [$scanner, $organizer] = $this->createScannerContext();

        Sanctum::actingAs($scanner);

        $response = $this->getJson('/api/v1/organizers/current/dashboard/summary', [
            'X-Organizer-Id' => (string) $organizer->id,
        ]);

        $response->assertForbidden();
    }

    public function test_staff_cannot_access_scanner_summary(): void
    {
        [$scanner, $organizer] = $this->createScannerContext();

        OrganizerMember::query()
            ->where('user_id', $scanner->id)
            ->update(['role' => 'staff']);

        Sanctum::actingAs($scanner);

        $response = $this->getJson('/api/v1/organizers/current/dashboard/scanner-summary', [
            'X-Organizer-Id' => (string) $organizer->id,
        ]);

        $response->assertForbidden();
    }
}
