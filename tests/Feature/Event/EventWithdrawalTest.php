<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Models\EventWithdrawal;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventWithdrawalTest extends TestCase
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
            'name' => 'Withdrawal Org',
            'slug' => 'withdrawal-org-'.Str::lower(Str::random(6)),
            'email' => 'withdrawal@example.com',
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
            'title' => 'Withdrawal Event',
            'slug' => 'withdrawal-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
            'settings' => [
                'finance' => [
                    'quotation_amount' => 10000,
                ],
            ],
        ]);

        return [$user, $organizer, $event];
    }

    public function test_organizer_can_create_event_withdrawal_request(): void
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
            'subtotal' => 200000,
            'total_amount' => 200000,
            'organizer_net_amount' => 200000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->postJson("/api/v1/events/{$event->uuid}/withdrawals", [
                'amount' => 50000,
                'bank_name' => 'BCA',
                'account_holder' => 'Event Owner',
                'account_number' => '1234567890',
                'notes' => 'Tahap pertama',
            ]);

        $response->assertCreated();
        $response->assertJsonPath('data.amount', 50000);
        $response->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('event_withdrawals', [
            'event_id' => $event->id,
            'amount' => 50000,
            'status' => 'pending',
        ]);
    }

    public function test_withdrawal_list_returns_balances_and_history(): void
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
            'subtotal' => 200000,
            'total_amount' => 200000,
            'organizer_net_amount' => 200000,
            'paid_at' => now(),
            'completed_at' => now(),
        ]);

        EventWithdrawal::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'amount' => 40000,
            'status' => 'paid',
            'bank_name' => 'BCA',
            'account_holder' => 'Owner',
            'account_number' => '123',
            'requested_at' => now()->subDays(2),
            'processed_at' => now()->subDay(),
        ]);

        EventWithdrawal::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'amount' => 30000,
            'status' => 'pending',
            'bank_name' => 'BCA',
            'account_holder' => 'Owner',
            'account_number' => '123',
            'requested_at' => now()->subHours(3),
        ]);

        Sanctum::actingAs($user);

        $response = $this->withHeader('X-Organizer-Id', (string) $organizer->id)
            ->getJson("/api/v1/events/{$event->uuid}/withdrawals");

        $response->assertOk();
        $response->assertJsonPath('data.withdrawn_total', 40000);
        $response->assertJsonPath('data.pending_balance', 30000);
        $response->assertJsonPath('data.available_balance', 120000);
        $response->assertJsonCount(2, 'data.data');
    }
}
