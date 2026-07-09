<?php

namespace Tests\Feature\Order;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class ExpirePendingOrdersTest extends TestCase
{
    use RefreshDatabase;

    public function test_expire_pending_orders_command_releases_reserved_inventory(): void
    {
        $organizerUser = User::factory()->create();
        $buyer = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Expire Organizer',
            'slug' => 'expire-org-'.Str::lower(Str::random(6)),
            'email' => 'expire@example.com',
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
            'title' => 'Expire Event',
            'slug' => 'expire-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(7),
            'end_at' => now()->addDays(8),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
            'published_at' => now(),
        ]);

        $ticketType = TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $organizer->id,
            'name' => 'Regular',
            'kind' => TicketKind::PAID,
            'price' => 100000,
            'currency' => 'IDR',
            'quantity' => 50,
            'sold_count' => 0,
            'reserved_count' => 2,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $order = Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-EXPIRE-001',
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'user_id' => $buyer->id,
            'buyer_name' => 'Expired Buyer',
            'buyer_email' => 'expired@example.com',
            'status' => OrderStatus::AWAITING_PAYMENT,
            'currency' => 'IDR',
            'subtotal' => 200000,
            'discount_amount' => 0,
            'platform_fee_pct_rate' => 0,
            'platform_fee_flat' => 0,
            'platform_fee_total' => 0,
            'fee_bearer' => 'attendee',
            'total_amount' => 200000,
            'organizer_net_amount' => 200000,
            'expires_at' => now()->subMinute(),
        ]);

        OrderItem::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_type_name' => $ticketType->name,
            'unit_price' => 100000,
            'quantity' => 2,
            'subtotal' => 200000,
        ]);

        Payment::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'gateway' => 'midtrans',
            'gateway_transaction_id' => $order->order_number,
            'status' => PaymentStatus::PENDING,
            'amount' => 200000,
            'currency' => 'IDR',
        ]);

        $this->artisan('orders:expire-pending')->assertSuccessful();

        $order->refresh();
        $ticketType->refresh();

        $this->assertSame(OrderStatus::EXPIRED, $order->status);
        $this->assertSame(0, $ticketType->reserved_count);
    }
}
