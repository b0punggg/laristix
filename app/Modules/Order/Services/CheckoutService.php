<?php

namespace App\Modules\Order\Services;

use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Support\EventCheckoutSettings;
use App\Modules\Order\Contracts\CheckoutServiceInterface;
use App\Modules\Order\Contracts\OrderFulfillmentServiceInterface;
use App\Modules\Order\Contracts\PromoCodeServiceInterface;
use App\Modules\Order\DTOs\CreateCheckoutDto;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Enums\RegistrationStatus;
use App\Modules\Order\Exceptions\CheckoutException;
use App\Modules\Order\Exceptions\OrderNotFoundException;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\PromoCode;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use App\Modules\Organizer\Services\OrganizerComplianceService;
use App\Modules\Payment\Contracts\MidtransSnapServiceInterface;
use App\Modules\Ticketing\Models\TicketType;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CheckoutService implements CheckoutServiceInterface
{
    public function __construct(
        private readonly OrderRepositoryInterface $orders,
        private readonly OrderFulfillmentServiceInterface $fulfillment,
        private readonly MidtransSnapServiceInterface $snapService,
        private readonly PlatformSettingServiceInterface $platformSettings,
        private readonly OrganizerComplianceService $complianceService,
        private readonly RegistrationFormService $registrationForms,
        private readonly PromoCodeServiceInterface $promoCodes,
        private readonly WaitingRoomServiceInterface $waitingRoom,
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
                ->with('organizer')
                ->where('uuid', $dto->eventUuid)
                ->whereIn('status', EventStatus::publicVisible())
                ->where('visibility', 'public')
                ->whereHas('organizer', fn ($q) => $q->where('status', 'active'))
                ->first();

            if ($event === null) {
                throw CheckoutException::make('Event is not available for checkout.', 404);
            }

            $checkoutSettings = EventCheckoutSettings::fromEventSettings($event->settings);

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

            $maxPerOrder = $checkoutSettings->effectiveMaxPerOrder($ticketType->max_per_order);

            if ($dto->quantity < $ticketType->min_per_order || $dto->quantity > $maxPerOrder) {
                throw CheckoutException::make(
                    "Quantity must be between {$ticketType->min_per_order} and {$maxPerOrder}."
                );
            }

            if ($ticketType->availableQuantity() < $dto->quantity) {
                throw CheckoutException::make('Insufficient ticket availability.');
            }

            $this->validateBuyerFields($checkoutSettings, $dto);
            $this->enforceOneEmailPerTransaction($checkoutSettings, $event->id, $dto->buyerEmail);

            $attendeePayloads = $this->resolveAttendeePayloads($checkoutSettings, $dto);

            $subtotal = round((float) $ticketType->price * $dto->quantity, 2);

            if ($subtotal > 0 && ! $this->complianceService->isVerified($event->organizer)) {
                throw CheckoutException::make(
                    'Penyelenggara belum menyelesaikan verifikasi KTP/NPWP untuk menjual tiket berbayar.'
                );
            }

            $promoResolution = $this->resolvePromoDiscount($event, $subtotal, $dto->promoCode);
            /** @var PromoCode|null $promo */
            $promo = $promoResolution['promo'];
            $discountAmount = $promoResolution['discount_amount'];

            $pricing = $this->calculatePricing(
                $event->organizer_id,
                $subtotal,
                $checkoutSettings->feeBearer,
                $discountAmount,
            );

            $buyerMetadata = $this->buildBuyerMetadata($dto);

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
                'discount_amount' => $pricing['discount_amount'],
                'platform_fee_pct_rate' => $pricing['platform_fee_pct_rate'],
                'platform_fee_flat' => $pricing['platform_fee_flat'],
                'platform_fee_total' => $pricing['platform_fee_total'],
                'fee_bearer' => $pricing['fee_bearer'],
                'total_amount' => $pricing['total_amount'],
                'organizer_net_amount' => $pricing['organizer_net_amount'],
                'promo_code_id' => $promo?->id,
                'promo_code_snapshot' => $promo?->code,
                'idempotency_key' => $dto->idempotencyKey,
                'expires_at' => now()->addMinutes($this->waitingRoom->getOrderTtlMinutes($event->id)),
                'ip_address' => $dto->ipAddress,
                'user_agent' => $dto->userAgent,
                'metadata' => $buyerMetadata !== [] ? ['buyer_profile' => $buyerMetadata] : null,
            ]);

            if ($promo !== null) {
                $this->promoCodes->reserve($order, $promo, $pricing['discount_amount']);
            }

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

            foreach ($attendeePayloads as $index => $attendee) {
                $seat = $index + 1;
                $validatedAnswers = $this->registrationForms->validateAnswers(
                    $event,
                    $attendee['answers'] ?? []
                );

                $registration = Registration::withoutOrganizerScope()->create([
                    'organizer_id' => $event->organizer_id,
                    'event_id' => $event->id,
                    'order_id' => $order->id,
                    'order_item_id' => $orderItem->id,
                    'ticket_type_id' => $ticketType->id,
                    'seat_index' => $seat,
                    'attendee_name' => $attendee['name'],
                    'attendee_email' => $attendee['email'] ?? $dto->buyerEmail,
                    'attendee_phone' => $attendee['phone'] ?? $dto->buyerPhone,
                    'metadata' => $this->buildAttendeeMetadata($attendee),
                    'status' => RegistrationStatus::PENDING,
                ]);

                if ($validatedAnswers !== []) {
                    $this->registrationForms->saveAnswers($registration, $validatedAnswers);
                }
            }

            if ((float) $order->total_amount <= 0) {
                $order->fill(['status' => OrderStatus::PAID, 'paid_at' => now()]);
                $order->save();
                $this->fulfillment->fulfill($order);

                return $this->buildCheckoutResponse($order->fresh(['items', 'payment', 'registrations.ticket']));
            }

            $order->fill(['status' => OrderStatus::AWAITING_PAYMENT]);
            $order->save();

            $this->snapService->initiate($order);

            return $this->buildCheckoutResponse($order->fresh(['items', 'payment', 'registrations.ticket']));
        });
    }

    /**
     * @return array{
     *   subtotal: float,
     *   platform_fee_pct_rate: float,
     *   platform_fee_flat: float,
     *   platform_fee_total: float,
     *   fee_bearer: string,
     *   total_amount: float,
     *   organizer_net_amount: float
     * }
     */
    public function quote(Event $event, TicketType $ticketType, int $quantity, ?string $promoCode = null): array
    {
        $checkoutSettings = EventCheckoutSettings::fromEventSettings($event->settings);
        $maxPerOrder = $checkoutSettings->effectiveMaxPerOrder($ticketType->max_per_order);

        if ($quantity < $ticketType->min_per_order || $quantity > $maxPerOrder) {
            throw CheckoutException::make(
                "Quantity must be between {$ticketType->min_per_order} and {$maxPerOrder}."
            );
        }

        $subtotal = round((float) $ticketType->price * $quantity, 2);
        $promoResolution = $this->resolvePromoDiscount($event, $subtotal, $promoCode);
        /** @var PromoCode|null $promo */
        $promo = $promoResolution['promo'];

        $pricing = $this->calculatePricing(
            $event->organizer_id,
            $subtotal,
            $checkoutSettings->feeBearer,
            $promoResolution['discount_amount'],
        );

        return array_merge(['subtotal' => $subtotal], $pricing, [
            'promo_code' => $promo?->code,
            'promo_description' => $promo?->description,
        ]);
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

    private function validateBuyerFields(EventCheckoutSettings $settings, CreateCheckoutDto $dto): void
    {
        $fields = $settings->buyerFields;
        $values = [
            'name' => $dto->buyerName,
            'email' => $dto->buyerEmail,
            'phone' => $dto->buyerPhone,
            'id_number' => $dto->buyerIdNumber,
            'date_of_birth' => $dto->buyerDateOfBirth,
            'gender' => $dto->buyerGender,
        ];

        foreach ($fields as $key => $config) {
            if (! $config['enabled']) {
                continue;
            }

            $value = $values[$key] ?? null;

            if ($config['required'] && ($value === null || trim((string) $value) === '')) {
                throw CheckoutException::make("Field pemesan {$key} wajib diisi.");
            }
        }
    }

    private function enforceOneEmailPerTransaction(
        EventCheckoutSettings $settings,
        int $eventId,
        string $buyerEmail
    ): void {
        if (! $settings->oneEmailPerTransaction) {
            return;
        }

        $hasExisting = Order::withoutOrganizerScope()
            ->where('event_id', $eventId)
            ->where('buyer_email', $buyerEmail)
            ->whereIn('status', [
                OrderStatus::PENDING,
                OrderStatus::AWAITING_PAYMENT,
                OrderStatus::PAID,
                OrderStatus::COMPLETED,
            ])
            ->exists();

        if ($hasExisting) {
            throw CheckoutException::make(
                'Email ini sudah digunakan untuk transaksi event ini. Satu email hanya boleh satu transaksi.'
            );
        }
    }

    /**
     * @return list<array{
     *   name: string,
     *   email?: string|null,
     *   phone?: string|null,
     *   id_number?: string|null,
     *   date_of_birth?: string|null,
     *   gender?: string|null,
     *   answers?: list<array{field_id: int, value: mixed}>
     * }>
     */
    private function resolveAttendeePayloads(EventCheckoutSettings $settings, CreateCheckoutDto $dto): array
    {
        if ($settings->oneAttendeePerTicket) {
            if (count($dto->attendees) !== $dto->quantity) {
                throw CheckoutException::make(
                    'Data peserta wajib diisi untuk setiap tiket ketika mode satu tiket satu data pemesan aktif.'
                );
            }

            foreach ($dto->attendees as $index => $attendee) {
                if (trim($attendee['name'] ?? '') === '') {
                    throw CheckoutException::make('Nama peserta tiket #'.($index + 1).' wajib diisi.');
                }
            }

            return $dto->attendees;
        }

        $payload = [
            'name' => $dto->buyerName,
            'email' => $dto->buyerEmail,
            'phone' => $dto->buyerPhone,
            'id_number' => $dto->buyerIdNumber,
            'date_of_birth' => $dto->buyerDateOfBirth,
            'gender' => $dto->buyerGender,
            'answers' => $dto->answers,
        ];

        return array_fill(0, $dto->quantity, $payload);
    }

    /**
     * @return array<string, string>
     */
    private function buildBuyerMetadata(CreateCheckoutDto $dto): array
    {
        $metadata = [];

        if ($dto->buyerIdNumber !== null && $dto->buyerIdNumber !== '') {
            $metadata['id_number'] = $dto->buyerIdNumber;
        }

        if ($dto->buyerDateOfBirth !== null && $dto->buyerDateOfBirth !== '') {
            $metadata['date_of_birth'] = $dto->buyerDateOfBirth;
        }

        if ($dto->buyerGender !== null && $dto->buyerGender !== '') {
            $metadata['gender'] = $dto->buyerGender;
        }

        return $metadata;
    }

    /**
     * @param  array<string, mixed>  $attendee
     * @return array<string, string>|null
     */
    private function buildAttendeeMetadata(array $attendee): ?array
    {
        $metadata = [];

        if (! empty($attendee['id_number'])) {
            $metadata['id_number'] = (string) $attendee['id_number'];
        }

        if (! empty($attendee['date_of_birth'])) {
            $metadata['date_of_birth'] = (string) $attendee['date_of_birth'];
        }

        if (! empty($attendee['gender'])) {
            $metadata['gender'] = (string) $attendee['gender'];
        }

        return $metadata !== [] ? $metadata : null;
    }

    /**
     * @return array{discount_amount: float, promo: PromoCode|null}
     */
    private function resolvePromoDiscount(Event $event, float $subtotal, ?string $promoCode): array
    {
        if ($promoCode === null || trim($promoCode) === '') {
            return [
                'discount_amount' => 0.0,
                'promo' => null,
            ];
        }

        $promo = $this->promoCodes->findForEvent($event, $promoCode);

        if ($promo === null) {
            throw CheckoutException::make('Kode promo tidak ditemukan.');
        }

        $this->promoCodes->validate($promo, $event, $subtotal);

        return [
            'discount_amount' => $this->promoCodes->calculateDiscount($promo, $subtotal),
            'promo' => $promo,
        ];
    }

    /**
     * @return array{
     *   discount_amount: float,
     *   platform_fee_pct_rate: float,
     *   platform_fee_flat: float,
     *   platform_fee_total: float,
     *   fee_bearer: string,
     *   total_amount: float,
     *   organizer_net_amount: float
     * }
     */
    private function calculatePricing(
        int $organizerId,
        float $subtotal,
        ?string $eventFeeBearer = null,
        float $discountAmount = 0,
    ): array {
        $config = OrganizerFeeConfig::query()
            ->where('organizer_id', $organizerId)
            ->where('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', now());
            })
            ->orderByDesc('effective_from')
            ->first();

        if ($config !== null) {
            return $this->buildPricing(
                $subtotal,
                $discountAmount,
                (float) $config->percentage_rate,
                (float) $config->flat_amount,
                $eventFeeBearer ?? $config->fee_bearer
            );
        }

        $default = $this->platformSettings->getValue('default_platform_fee');

        if ($default !== null) {
            return $this->buildPricing(
                $subtotal,
                $discountAmount,
                (float) ($default['percentage_rate'] ?? 0),
                (float) ($default['flat_amount'] ?? 0),
                $eventFeeBearer ?? (string) ($default['fee_bearer'] ?? 'attendee')
            );
        }

        $feeBearer = $eventFeeBearer ?? 'attendee';

        return $this->buildPricing($subtotal, $discountAmount, 0, 0, $feeBearer);
    }

    /**
     * @return array{
     *   discount_amount: float,
     *   platform_fee_pct_rate: float,
     *   platform_fee_flat: float,
     *   platform_fee_total: float,
     *   fee_bearer: string,
     *   total_amount: float,
     *   organizer_net_amount: float
     * }
     */
    private function buildPricing(
        float $subtotal,
        float $discountAmount,
        float $pctRate,
        float $flat,
        string $feeBearer
    ): array {
        $discountAmount = min(max(0, round($discountAmount, 2)), $subtotal);
        $netSubtotal = round($subtotal - $discountAmount, 2);
        $feeTotal = round($netSubtotal * $pctRate / 100 + $flat, 2);
        $totalAmount = $feeBearer === 'attendee' ? $netSubtotal + $feeTotal : $netSubtotal;
        $organizerNet = $feeBearer === 'organizer' ? $netSubtotal - $feeTotal : $netSubtotal;

        return [
            'discount_amount' => $discountAmount,
            'platform_fee_pct_rate' => $pctRate,
            'platform_fee_flat' => $flat,
            'platform_fee_total' => $feeTotal,
            'fee_bearer' => $feeBearer,
            'total_amount' => max(0, $totalAmount),
            'organizer_net_amount' => max(0, $organizerNet),
        ];
    }
}
