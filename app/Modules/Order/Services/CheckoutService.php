<?php

namespace App\Modules\Order\Services;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Contracts\CheckoutServiceInterface;
use App\Modules\Order\Contracts\OrderFulfillmentServiceInterface;
use App\Modules\Order\DTOs\CreateCheckoutDto;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Enums\RegistrationStatus;
use App\Modules\Order\Exceptions\CheckoutException;
use App\Modules\Order\Exceptions\OrderNotFoundException;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use App\Modules\Payment\Contracts\MidtransSnapServiceInterface;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService implements CheckoutServiceInterface
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderFulfillmentServiceInterface $fulfillment,
        private readonly MidtransSnapServiceInterface $snapService,
    ) {}

    public function checkout(CreateCheckoutDto $dto): array
    {
        if ($dto->idempotencyKey !== null) {
            $existing = $this->orders->findByIdempotencyKey($dto->idempotencyKey);

            if ($existing !== null) {
                return $this->buildCheckoutResponse($existing);
            }
        }

        return DB::transaction(function () use ($dto) {
            $event = Event::withoutOrganizerScope()
                ->where('uuid', $dto->eventUuid)
                ->whereIn('status', EventStatus::publicVisible())
                ->where('visibility', 'public')
                ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
                ->first();

            if ($event === null) {
                throw CheckoutException::make('Event is not available for checkout.', 404);
            }

            $ticketType = TicketType::withoutOrganizerScope()
                ->whereKey($dto->ticketTypeId)
                ->where('event_id', $event->id)
                ->lockForUpdate()
                ->first();

            if ($ticketType === null) {
                throw CheckoutException::make('Ticket type not found for this event.', 404);
            }

            if (! $ticketType->isPurchasable()) {
                throw CheckoutException::make('This ticket is not available for purchase.');
            }

            if ($dto->quantity < $ticketType->min_per_order || $dto->quantity > $ticketType->max_per_order) {
                throw CheckoutException::make(
                    "Quantity must be between {$ticketType->min_per_order} and {$ticketType->max_per_order}."
                );
            }

            if ($ticketType->availableQuantity() < $dto->quantity) {
                throw CheckoutException::make('Insufficient ticket availability.');
            }

            $subtotal = round((float) $ticketType->price * $dto->quantity, 2);
            $pricing = $this->calculatePricing($event->organizer_id, $subtotal);

            $order = $this->orders->create([
                'order_number' => $this->generateOrderNumber(),
                'organizer_id' => $event->organizer_id,
                'event_id' => $event->id,
                'user_id' => $dto->userId,
                'buyer_name' => $dto->buyerName,
                'buyer_email' => $dto->buyerEmail,
                'buyer_phone' => $dto->buyerPhone,
                'status' => OrderStatus::PENDING,
                'currency' => $ticketType->currency,
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'platform_fee_pct_rate' => $pricing['platform_fee_pct_rate'],
                'platform_fee_flat' => $pricing['platform_fee_flat'],
                'platform_fee_total' => $pricing['platform_fee_total'],
                'fee_bearer' => $pricing['fee_bearer'],
                'total_amount' => $pricing['total_amount'],
                'organizer_net_amount' => $pricing['organizer_net_amount'],
                'idempotency_key' => $dto->idempotencyKey,
                'expires_at' => now()->addMinutes((int) config('order_module.order_ttl_minutes', 30)),
                'ip_address' => $dto->ipAddress,
                'user_agent' => $dto->userAgent,
            ]);

            $orderItem = OrderItem::withoutOrganizerScope()->create([
                'order_id' => $order->id,
                'organizer_id' => $event->organizer_id,
                'event_id' => $event->id,
                'ticket_type_id' => $ticketType->id,
                'ticket_type_name' => $ticketType->name,
                'unit_price' => $ticketType->price,
                'quantity' => $dto->quantity,
                'subtotal' => $subtotal,
            ]);

            $ticketType->increment('reserved_count', $dto->quantity);

            for ($seat = 1; $seat <= $dto->quantity; $seat++) {
                Registration::withoutOrganizerScope()->create([
                    'organizer_id' => $event->organizer_id,
                    'event_id' => $event->id,
                    'order_id' => $order->id,
                    'order_item_id' => $orderItem->id,
                    'ticket_type_id' => $ticketType->id,
                    'seat_index' => $seat,
                    'attendee_name' => $dto->buyerName,
                    'attendee_email' => $dto->buyerEmail,
                    'attendee_phone' => $dto->buyerPhone,
                    'status' => RegistrationStatus::PENDING,
                ]);
            }

            if ((float) $order->total_amount <= 0) {
                $order->fill(['status' => OrderStatus::PAID, 'paid_at' => now()]);
                $order->save();
                $this->fulfillment->fulfill($order);

                return $this->buildCheckoutResponse($order->fresh(['items', 'payment', 'registrations.ticket']));
            }

            $order->fill(['status' => OrderStatus::AWAITING_PAYMENT]);
            $order->save();

            $payment = $this->snapService->initiate($order);

            return $this->buildCheckoutResponse($order->fresh(['items', 'payment', 'registrations.ticket']));
        });
    }

    public function showPublic(string $uuid): Order
    {
        $order = $this->orders->findByUuid($uuid);

        if ($order === null) {
            throw OrderNotFoundException::make();
        }

        return $order;
    }

    public function showForUser(string $uuid, int $userId): Order
    {
        $order = $this->showPublic($uuid);

        if ($order->user_id !== $userId) {
            throw OrderNotFoundException::make();
        }

        return $order;
    }

    public function listForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return $this->orders->paginateForUser($userId, $perPage);
    }

    /**
     * @return array{order: Order, snap_token: string|null, client_key: string|null}
     */
    private function buildCheckoutResponse(Order $order): array
    {
        $snapToken = $order->payment?->gateway_response['snap_token'] ?? null;

        return [
            'order' => $order,
            'snap_token' => is_string($snapToken) ? $snapToken : null,
            'client_key' => config('payment_module.midtrans.client_key') ?: null,
        ];
    }

    private function generateOrderNumber(): string
    {
        do {
            $number = config('order_module.order_number_prefix', 'ORD')
                .'-'.now()->format('Ymd')
                .'-'.strtoupper(Str::random(8));
        } while ($this->orders->findByOrderNumber($number) !== null);

        return $number;
    }

    /**
     * @return array{
     *   platform_fee_pct_rate: float,
     *   platform_fee_flat: float,
     *   platform_fee_total: float,
     *   fee_bearer: string,
     *   total_amount: float,
     *   organizer_net_amount: float
     * }
     */
    private function calculatePricing(int $organizerId, float $subtotal): array
    {
        $config = OrganizerFeeConfig::query()
            ->where('organizer_id', $organizerId)
            ->where('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', now());
            })
            ->orderByDesc('effective_from')
            ->first();

        if ($config === null) {
            return [
                'platform_fee_pct_rate' => 0,
                'platform_fee_flat' => 0,
                'platform_fee_total' => 0,
                'fee_bearer' => 'attendee',
                'total_amount' => $subtotal,
                'organizer_net_amount' => $subtotal,
            ];
        }

        $pctRate = (float) $config->percentage_rate;
        $flat = (float) $config->flat_amount;
        $feeTotal = round($subtotal * $pctRate / 100 + $flat, 2);
        $feeBearer = $config->fee_bearer;
        $totalAmount = $feeBearer === 'attendee' ? $subtotal + $feeTotal : $subtotal;
        $organizerNet = $feeBearer === 'organizer' ? $subtotal - $feeTotal : $subtotal;

        return [
            'platform_fee_pct_rate' => $pctRate,
            'platform_fee_flat' => $flat,
            'platform_fee_total' => $feeTotal,
            'fee_bearer' => $feeBearer,
            'total_amount' => max(0, $totalAmount),
            'organizer_net_amount' => max(0, $organizerNet),
        ];
    }
}
