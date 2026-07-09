<?php

namespace App\Modules\Event\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventAttendeeServiceInterface;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Exceptions\OrderNotFoundException;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\Registration;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class EventAttendeeService implements EventAttendeeServiceInterface
{
    /** @var list<string> */
    private const VISIBLE_ORDER_STATUSES = [
        OrderStatus::AWAITING_PAYMENT,
        OrderStatus::PAID,
        OrderStatus::COMPLETED,
    ];

    public function __construct(
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function paginate(
        Event $event,
        Organizer $organizer,
        User $user,
        ?string $search = null,
        ?string $orderStatus = null,
        int $perPage = 25,
    ): LengthAwarePaginator {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $perPage = min(max($perPage, 1), 100);

        $query = Registration::query()
            ->where('event_id', $event->id)
            ->whereHas('order', function (Builder $orderQuery) use ($orderStatus) {
                $statuses = self::VISIBLE_ORDER_STATUSES;

                if ($orderStatus !== null && $orderStatus !== '' && $orderStatus !== 'all') {
                    $statuses = in_array($orderStatus, self::VISIBLE_ORDER_STATUSES, true)
                        ? [$orderStatus]
                        : self::VISIBLE_ORDER_STATUSES;
                }

                $orderQuery->whereIn('status', $statuses);
            })
            ->with([
                'order:id,uuid,order_number,buyer_name,buyer_email,buyer_phone,status,paid_at,completed_at,created_at,metadata',
                'ticketType:id,name',
                'ticket:id,registration_id,ticket_code,status,checked_in_at',
                'answers:id,registration_id,form_field_id,field_label,field_name,value_text,value_json',
            ])
            ->orderByDesc('created_at');

        if ($search !== null && trim($search) !== '') {
            $term = '%'.trim($search).'%';

            $query->where(function (Builder $builder) use ($term) {
                $builder
                    ->where('attendee_name', 'like', $term)
                    ->orWhere('attendee_email', 'like', $term)
                    ->orWhere('attendee_phone', 'like', $term)
                    ->orWhereHas('order', function (Builder $orderQuery) use ($term) {
                        $orderQuery
                            ->where('buyer_name', 'like', $term)
                            ->orWhere('buyer_email', 'like', $term)
                            ->orWhere('order_number', 'like', $term);
                    })
                    ->orWhereHas('ticket', fn (Builder $ticketQuery) => $ticketQuery->where('ticket_code', 'like', $term));
            });
        }

        return $query
            ->paginate($perPage)
            ->through(fn (Registration $registration) => $this->transformRegistration($registration));
    }

    public function showOrder(Event $event, Organizer $organizer, User $user, string $orderUuid): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $order = Order::query()
            ->where('uuid', $orderUuid)
            ->where('event_id', $event->id)
            ->where('organizer_id', $organizer->id)
            ->with([
                'items',
                'payment',
                'registrations.ticket',
                'registrations.ticketType',
                'registrations.answers',
            ])
            ->first();

        if ($order === null) {
            throw OrderNotFoundException::make();
        }

        return $this->transformOrderDetail($order);
    }

    /**
     * @return array<string, mixed>
     */
    private function transformOrderDetail(Order $order): array
    {
        $metadata = is_array($order->metadata) ? $order->metadata : [];
        $buyerProfile = is_array($metadata['buyer_profile'] ?? null) ? $metadata['buyer_profile'] : [];
        $isFree = (float) $order->total_amount <= 0;

        return [
            'uuid' => $order->uuid,
            'order_number' => $order->order_number,
            'created_at' => $order->created_at?->toIso8601String(),
            'paid_at' => $order->paid_at?->toIso8601String(),
            'completed_at' => $order->completed_at?->toIso8601String(),
            'status' => $order->status,
            'transaction_type' => $isFree ? 'free' : 'paid',
            'transaction_type_label' => $isFree ? 'Gratis' : 'Berbayar',
            'purchase_source' => $this->resolvePurchaseSource($order),
            'invoice_status' => $this->resolveInvoiceStatus($order),
            'invoice_status_label' => $this->resolveInvoiceStatusLabel($order),
            'buyer_name' => $order->buyer_name,
            'buyer_email' => $order->buyer_email,
            'buyer_phone' => $order->buyer_phone,
            'buyer_id_number' => $buyerProfile['id_number'] ?? null,
            'buyer_date_of_birth' => $buyerProfile['date_of_birth'] ?? null,
            'buyer_gender' => $buyerProfile['gender'] ?? null,
            'currency' => $order->currency,
            'subtotal' => (float) $order->subtotal,
            'discount_amount' => (float) $order->discount_amount,
            'platform_fee_total' => (float) $order->platform_fee_total,
            'total_amount' => (float) $order->total_amount,
            'organizer_net_amount' => (float) $order->organizer_net_amount,
            'fee_bearer' => $order->fee_bearer,
            'promo_code' => $order->promo_code_snapshot,
            'coupon_code' => $order->coupon_snapshot,
            'items' => $order->items->map(fn ($item) => [
                'ticket_type_name' => $item->ticket_type_name,
                'quantity' => $item->quantity,
                'unit_price' => (float) $item->unit_price,
                'subtotal' => (float) $item->subtotal,
            ])->values()->all(),
            'tickets' => $order->registrations->map(function (Registration $registration) {
                $attendeeMetadata = is_array($registration->metadata) ? $registration->metadata : [];

                return [
                    'uuid' => $registration->uuid,
                    'seat_index' => $registration->seat_index,
                    'attendee_name' => $registration->attendee_name,
                    'attendee_email' => $registration->attendee_email,
                    'attendee_phone' => $registration->attendee_phone,
                    'id_number' => $attendeeMetadata['id_number'] ?? null,
                    'ticket_type_name' => $registration->ticketType?->name,
                    'ticket_code' => $registration->ticket?->ticket_code,
                    'ticket_status' => $registration->ticket?->status,
                    'checked_in_at' => $registration->ticket?->checked_in_at?->toIso8601String(),
                    'registration_status' => $registration->status,
                    'custom_answers' => $registration->answers
                        ->map(fn ($answer) => [
                            'label' => $answer->field_label,
                            'value' => $answer->value_text ?? $answer->value_json,
                        ])
                        ->values()
                        ->all(),
                ];
            })->values()->all(),
            'payment' => $order->payment === null ? null : [
                'gateway' => $order->payment->gateway,
                'payment_method' => $order->payment->payment_method,
                'status' => $order->payment->status,
                'amount' => (float) $order->payment->amount,
                'paid_at' => $order->payment->paid_at?->toIso8601String(),
            ],
        ];
    }

    private function resolvePurchaseSource(Order $order): string
    {
        if ($order->user_id !== null) {
            return 'Website Laristix (akun pengguna)';
        }

        return 'Website Laristix';
    }

    private function resolveInvoiceStatus(Order $order): string
    {
        if ((float) $order->total_amount <= 0) {
            return in_array($order->status, [OrderStatus::COMPLETED, OrderStatus::PAID], true)
                ? 'issued'
                : 'pending';
        }

        if ($order->payment !== null) {
            return match ($order->payment->status) {
                'success' => 'paid',
                'pending', 'processing' => 'pending',
                'failed' => 'failed',
                'expired' => 'expired',
                'refunded', 'partially_refunded' => 'refunded',
                default => $order->status,
            };
        }

        return match ($order->status) {
            OrderStatus::COMPLETED, OrderStatus::PAID => 'paid',
            OrderStatus::AWAITING_PAYMENT, OrderStatus::PENDING => 'pending',
            OrderStatus::EXPIRED => 'expired',
            OrderStatus::CANCELLED => 'cancelled',
            OrderStatus::REFUNDED, OrderStatus::PARTIALLY_REFUNDED => 'refunded',
            default => $order->status,
        };
    }

    private function resolveInvoiceStatusLabel(Order $order): string
    {
        return match ($this->resolveInvoiceStatus($order)) {
            'paid' => 'Lunas',
            'issued' => 'Tiket diterbitkan',
            'pending' => 'Menunggu pembayaran',
            'failed' => 'Pembayaran gagal',
            'expired' => 'Kedaluwarsa',
            'cancelled' => 'Dibatalkan',
            'refunded' => 'Direfund',
            default => ucfirst(str_replace('_', ' ', $order->status)),
        };
    }

    /**
     * @return array<string, mixed>
     */
    private function transformRegistration(Registration $registration): array
    {
        $metadata = is_array($registration->metadata) ? $registration->metadata : [];
        $order = $registration->order;
        $orderMetadata = is_array($order?->metadata) ? $order->metadata : [];
        $buyerProfile = is_array($orderMetadata['buyer_profile'] ?? null)
            ? $orderMetadata['buyer_profile']
            : [];

        return [
            'uuid' => $registration->uuid,
            'seat_index' => $registration->seat_index,
            'attendee_name' => $registration->attendee_name,
            'attendee_email' => $registration->attendee_email,
            'attendee_phone' => $registration->attendee_phone,
            'id_number' => $metadata['id_number'] ?? null,
            'date_of_birth' => $metadata['date_of_birth'] ?? null,
            'gender' => $metadata['gender'] ?? null,
            'status' => $registration->status,
            'ticket_type_name' => $registration->ticketType?->name,
            'ticket_code' => $registration->ticket?->ticket_code,
            'checked_in_at' => $registration->ticket?->checked_in_at?->toIso8601String(),
            'order' => $order === null ? null : [
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'buyer_name' => $order->buyer_name,
                'buyer_email' => $order->buyer_email,
                'buyer_phone' => $order->buyer_phone,
                'buyer_id_number' => $buyerProfile['id_number'] ?? null,
                'buyer_date_of_birth' => $buyerProfile['date_of_birth'] ?? null,
                'buyer_gender' => $buyerProfile['gender'] ?? null,
                'status' => $order->status,
                'paid_at' => $order->paid_at?->toIso8601String(),
                'completed_at' => $order->completed_at?->toIso8601String(),
                'created_at' => $order->created_at?->toIso8601String(),
            ],
            'custom_answers' => $registration->answers
                ->map(fn ($answer) => [
                    'field_id' => $answer->form_field_id,
                    'label' => $answer->field_label,
                    'name' => $answer->field_name,
                    'value' => $answer->value_text ?? $answer->value_json,
                ])
                ->values()
                ->all(),
            'created_at' => $registration->created_at?->toIso8601String(),
        ];
    }

    private function assertMemberOrSuperAdmin(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if ($this->members->findActiveMembership($user->id, $organizer->id) === null) {
            throw OrganizerAccessDeniedException::make();
        }
    }

    private function assertNotScanner(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership !== null && $membership->role === OrganizerMemberRole::SCANNER) {
            throw OrganizerAccessDeniedException::make('Scanner role cannot access this resource.');
        }
    }
}
