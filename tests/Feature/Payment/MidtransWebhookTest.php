<?php

namespace Tests\Feature\Payment;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\Ticket;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Payment\Enums\PaymentStatus;
use App\Modules\Payment\Models\Payment;
use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Models\TicketType;
use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MidtransWebhookTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: Order, 1: User}
     */
    private function createAwaitingPaymentOrder(): array
    {
        config(['payment_module.midtrans.server_key' => 'SB-Mid-server-test']);

        $organizerUser = User::factory()->create();
        $buyer = User::factory()->create([
            'email' => 'payer@example.com',
        ]);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Webhook Organizer',
            'slug' => 'webhook-org-'.Str::lower(Str::random(6)),
            'email' => 'webhook@example.com',
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
            'title' => 'Webhook Event',
            'slug' => 'webhook-event',
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
            'name' => 'Paid Ticket',
            'kind' => TicketKind::PAID,
            'price' => 150000,
            'currency' => 'IDR',
            'quantity' => 20,
            'sold_count' => 0,
            'reserved_count' => 1,
            'min_per_order' => 1,
            'max_per_order' => 5,
            'visibility' => 'public',
            'status' => 'active',
        ]);

        $order = Order::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'order_number' => 'ORD-TEST-'.strtoupper(Str::random(6)),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'user_id' => $buyer->id,
            'buyer_name' => 'Payer',
            'buyer_email' => 'payer@example.com',
            'status' => OrderStatus::AWAITING_PAYMENT,
            'currency' => 'IDR',
            'subtotal' => 150000,
            'total_amount' => 150000,
            'organizer_net_amount' => 150000,
            'expires_at' => now()->addMinutes(30),
        ]);

        \App\Modules\Order\Models\OrderItem::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'ticket_type_id' => $ticketType->id,
            'ticket_type_name' => $ticketType->name,
            'unit_price' => 150000,
            'quantity' => 1,
            'subtotal' => 150000,
        ]);

        \App\Modules\Order\Models\Registration::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'order_id' => $order->id,
            'order_item_id' => $order->items()->first()->id,
            'ticket_type_id' => $ticketType->id,
            'seat_index' => 1,
            'attendee_name' => 'Payer',
            'attendee_email' => 'payer@example.com',
            'status' => 'pending',
        ]);

        Payment::withoutOrganizerScope()->create([
            'order_id' => $order->id,
            'organizer_id' => $organizer->id,
            'gateway' => 'midtrans',
            'gateway_transaction_id' => $order->order_number,
            'status' => PaymentStatus::PENDING,
            'amount' => 150000,
            'currency' => 'IDR',
        ]);

        return [
            $order->fresh(['payment', 'items', 'registrations']),
            $buyer,
        ];
    }

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function signedPayload(Order $order, array $overrides = []): array
    {
        $orderId = $order->order_number;
        $statusCode = '200';
        $grossAmount = (string) (int) $order->total_amount;
        $serverKey = config('payment_module.midtrans.server_key');
        $signature = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return array_merge([
            'order_id' => $orderId,
            'status_code' => $statusCode,
            'gross_amount' => $grossAmount,
            'signature_key' => $signature,
            'transaction_status' => 'settlement',
            'transaction_id' => 'TXN-'.Str::upper(Str::random(8)),
            'payment_type' => 'bank_transfer',
        ], $overrides);
    }

    public function test_webhook_marks_order_paid_and_issues_ticket(): void
    {
        [$order] = $this->createAwaitingPaymentOrder();

        $response = $this->postJson('/api/v1/webhooks/midtrans', $this->signedPayload($order));

        $response->assertOk();
        $response->assertJsonPath('processed', true);

        $order->refresh();
        $this->assertSame(OrderStatus::COMPLETED, $order->status);
        $this->assertSame(PaymentStatus::PAID, $order->payment->status);
        $this->assertSame(1, Ticket::withoutOrganizerScope()->count());
    }

    public function test_webhook_rejects_invalid_signature(): void
    {
        [$order] = $this->createAwaitingPaymentOrder();
        $payload = $this->signedPayload($order);
        $payload['signature_key'] = 'invalid';

        $response = $this->postJson('/api/v1/webhooks/midtrans', $payload);

        $response->assertForbidden();
    }

    public function test_validate_payment_endpoint_syncs_status(): void
    {
        [$order, $buyer] = $this->createAwaitingPaymentOrder();
        Sanctum::actingAs($buyer);

        \Illuminate\Support\Facades\Http::fake([
            'https://api.sandbox.midtrans.com/v2/*' => \Illuminate\Support\Facades\Http::response([
                'order_id' => $order->order_number,
                'transaction_status' => 'settlement',
                'gross_amount' => (string) (int) $order->total_amount,
                'payment_type' => 'credit_card',
            ], 200),
        ]);

        $response = $this->postJson("/api/v1/public/orders/{$order->uuid}/validate-payment");

        $response->assertOk();
        $response->assertJsonPath('data.valid', true);
        $response->assertJsonPath('data.payment_status', 'paid');
        $response->assertJsonPath('order.status', OrderStatus::COMPLETED);
    }
}
