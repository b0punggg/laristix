<?php

namespace Tests\Feature\Ticketing;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketTypeManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Organizer, 2: Event}
     */
    private function createEventContext(): array
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Ticket Organizer',
            'slug' => 'ticket-org-'.Str::lower(Str::random(8)),
            'email' => 'ticket-org@example.com',
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
            'title' => 'Ticket Test Event',
            'slug' => 'ticket-test-event',
            'status' => EventStatus::DRAFT,
            'visibility' => 'public',
            'start_at' => now()->addDays(14),
            'end_at' => now()->addDays(15),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        return [$user, $organizer, $event];
    }

    public function test_owner_can_create_free_ticket(): void
    {
        [$user, , $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/events/{$event->uuid}/ticket-types", [
            'kind' => TicketKind::FREE,
            'quantity' => 100,
            'sales_start_at' => now()->addDay()->toIso8601String(),
            'sales_end_at' => now()->addDays(10)->toIso8601String(),
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.kind', TicketKind::FREE);
        $response->assertJsonPath('data.price', 0);
        $response->assertJsonPath('data.quantity', 100);
        $response->assertJsonPath('data.name', 'Free Ticket');
    }

    public function test_owner_can_create_paid_ticket(): void
    {
        [$user, , $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/events/{$event->uuid}/ticket-types", [
            'kind' => TicketKind::PAID,
            'name' => 'Regular',
            'price' => 150000,
            'quantity' => 200,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.kind', TicketKind::PAID);
        $response->assertJsonPath('data.price', 150000);
    }

    public function test_owner_can_create_vip_ticket_with_sales_period(): void
    {
        [$user, , $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $salesStart = now()->addDay()->toIso8601String();
        $salesEnd = now()->addDays(12)->toIso8601String();

        $response = $this->postJson("/api/v1/events/{$event->uuid}/ticket-types", [
            'kind' => TicketKind::VIP,
            'name' => 'VIP Lounge',
            'price' => 750000,
            'quantity' => 25,
            'sales_start_at' => $salesStart,
            'sales_end_at' => $salesEnd,
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.kind', TicketKind::VIP);
        $response->assertJsonPath('data.available_quantity', 25);
        $this->assertNotNull($response->json('data.sales_start_at'));
    }

    public function test_paid_ticket_requires_positive_price(): void
    {
        [$user, , $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/events/{$event->uuid}/ticket-types", [
            'kind' => TicketKind::PAID,
            'price' => 0,
            'quantity' => 10,
        ]);

        $response->assertStatus(422);
    }

    public function test_owner_can_update_ticket_quota(): void
    {
        [$user, , $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $create = $this->postJson("/api/v1/events/{$event->uuid}/ticket-types", [
            'kind' => TicketKind::PAID,
            'price' => 100000,
            'quantity' => 50,
        ]);

        $ticketTypeId = $create->json('data.id');

        $response = $this->patchJson("/api/v1/events/{$event->uuid}/ticket-types/{$ticketTypeId}", [
            'quantity' => 80,
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.quantity', 80);
        $response->assertJsonPath('data.available_quantity', 80);
    }

    public function test_owner_can_delete_unused_ticket_type(): void
    {
        [$user, , $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $create = $this->postJson("/api/v1/events/{$event->uuid}/ticket-types", [
            'kind' => TicketKind::FREE,
            'quantity' => 10,
        ]);

        $ticketTypeId = $create->json('data.id');

        $response = $this->deleteJson("/api/v1/events/{$event->uuid}/ticket-types/{$ticketTypeId}");

        $response->assertOk();
        $this->assertSoftDeleted('ticket_types', ['id' => $ticketTypeId]);
    }

    public function test_cannot_delete_ticket_type_with_sales(): void
    {
        [$user, $organizer, $event] = $this->createEventContext();
        Sanctum::actingAs($user);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => 'Sold Ticket',
            'kind' => TicketKind::PAID,
            'price' => 50000,
            'currency' => 'IDR',
            'quantity' => 10,
            'sold_count' => 2,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $response = $this->deleteJson("/api/v1/events/{$event->uuid}/ticket-types/{$ticketType->id}");

        $response->assertForbidden();
    }

    public function test_public_endpoint_lists_purchasable_tickets_for_published_event(): void
    {
        [$user, $organizer] = $this->createEventContext();

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $user->id,
            'title' => 'Public Ticket Event',
            'slug' => 'public-ticket-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(14),
            'end_at' => now()->addDays(15),
            'timezone' => 'Asia/Jakarta',
            'published_at' => now(),
            'is_free' => false,
        ]);

        TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => 'Free Entry',
            'kind' => TicketKind::FREE,
            'price' => 0,
            'currency' => 'IDR',
            'quantity' => 100,
            'sold_count' => 0,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'sales_start_at' => now()->subDay(),
            'sales_end_at' => now()->addDays(10),
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $response = $this->getJson("/api/v1/public/events/{$event->uuid}/ticket-types");

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.kind', TicketKind::FREE);
        $response->assertJsonPath('data.0.is_purchasable', true);
    }
}
