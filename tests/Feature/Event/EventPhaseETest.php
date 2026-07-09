<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventPhaseETest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Event}
     */
    private function createOwnerWithEvent(array $settings = []): array
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Phase E Organizer',
            'slug' => 'phase-e-org-'.Str::lower(Str::random(8)),
            'email' => 'phase-e-'.Str::random(6).'@example.com',
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
            'title' => 'Phase E Event',
            'slug' => 'phase-e-event-'.Str::lower(Str::random(6)),
            'status' => EventStatus::DRAFT,
            'visibility' => 'public',
            'start_at' => now()->addDays(7),
            'end_at' => now()->addDays(8),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
            'settings' => $settings,
        ]);

        return [$user, $event];
    }

    public function test_owner_can_save_checkout_settings(): void
    {
        [$user, $event] = $this->createOwnerWithEvent();
        Sanctum::actingAs($user);

        $response = $this->patchJson("/api/v1/events/{$event->uuid}", [
            'settings' => [
                'checkout' => [
                    'max_tickets_per_transaction' => 3,
                    'one_email_per_transaction' => true,
                    'one_attendee_per_ticket' => true,
                    'fee_bearer' => 'organizer',
                    'buyer_fields' => [
                        'phone' => ['enabled' => true, 'required' => true],
                        'id_number' => ['enabled' => true, 'required' => false],
                    ],
                ],
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.settings.checkout.max_tickets_per_transaction', 3);
        $response->assertJsonPath('data.settings.checkout.one_email_per_transaction', true);
        $response->assertJsonPath('data.settings.checkout.fee_bearer', 'organizer');
    }

    public function test_checkout_enforces_one_email_per_transaction(): void
    {
        $buyer = User::factory()->create();

        [, $event] = $this->createOwnerWithEvent([
            'checkout' => [
                'one_email_per_transaction' => true,
            ],
        ]);

        $event->update([
            'status' => EventStatus::PUBLISHED,
            'published_at' => now(),
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $event->organizer_id,
            'name' => 'Regular',
            'kind' => TicketKind::FREE,
            'price' => 0,
            'currency' => 'IDR',
            'quantity' => 20,
            'sold_count' => 0,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        Sanctum::actingAs($buyer);

        $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Budi',
            'buyer_email' => 'budi@example.com',
        ])->assertCreated();

        $second = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 1,
            'buyer_name' => 'Budi Lagi',
            'buyer_email' => 'budi@example.com',
        ]);

        $second->assertStatus(422);
    }

    public function test_checkout_requires_attendee_data_per_ticket_when_enabled(): void
    {
        $buyer = User::factory()->create();

        [, $event] = $this->createOwnerWithEvent([
            'checkout' => [
                'one_attendee_per_ticket' => true,
            ],
        ]);

        $event->update([
            'status' => EventStatus::PUBLISHED,
            'published_at' => now(),
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $event->organizer_id,
            'name' => 'Free',
            'kind' => TicketKind::FREE,
            'price' => 0,
            'currency' => 'IDR',
            'quantity' => 20,
            'sold_count' => 0,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        Sanctum::actingAs($buyer);

        $missing = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 2,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer@example.com',
        ]);

        $missing->assertStatus(422);

        $success = $this->postJson("/api/v1/public/events/{$event->uuid}/checkout", [
            'ticket_type_id' => $ticketType->id,
            'quantity' => 2,
            'buyer_name' => 'Buyer',
            'buyer_email' => 'buyer2@example.com',
            'attendees' => [
                ['name' => 'Peserta 1', 'email' => 'p1@example.com'],
                ['name' => 'Peserta 2', 'email' => 'p2@example.com'],
            ],
        ]);

        $success->assertCreated();
        $success->assertJsonPath('data.order.registrations.0.attendee_name', 'Peserta 1');
        $success->assertJsonPath('data.order.registrations.1.attendee_name', 'Peserta 2');
    }

    public function test_event_fee_bearer_overrides_organizer_default_in_quote(): void
    {
        [, $event] = $this->createOwnerWithEvent([
            'checkout' => [
                'fee_bearer' => 'organizer',
            ],
        ]);

        $event->update([
            'status' => EventStatus::PUBLISHED,
            'published_at' => now(),
        ]);

        OrganizerFeeConfig::query()->create([
            'organizer_id' => $event->organizer_id,
            'fee_type' => 'percentage',
            'percentage_rate' => 10,
            'flat_amount' => 0,
            'fee_bearer' => 'attendee',
            'effective_from' => now()->subDay(),
            'created_by' => $event->created_by,
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $event->organizer_id,
            'name' => 'Paid',
            'kind' => TicketKind::PAID,
            'price' => 100000,
            'currency' => 'IDR',
            'quantity' => 20,
            'sold_count' => 0,
            'reserved_count' => 0,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $response = $this->getJson(
            "/api/v1/public/events/{$event->uuid}/checkout/quote?ticket_type_id={$ticketType->id}&quantity=1"
        );

        $response->assertOk();
        $response->assertJsonPath('data.fee_bearer', 'organizer');
        $response->assertJsonPath('data.total_amount', 100000);
        $response->assertJsonPath('data.organizer_net_amount', 90000);
    }
}
