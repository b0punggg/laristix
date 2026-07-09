<?php

namespace App\Modules\Order\Services;

use App\Modules\Order\Contracts\OrderFulfillmentServiceInterface;
use App\Modules\Order\Contracts\PromoCodeServiceInterface;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Enums\RegistrationStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\Registration;
use App\Modules\Order\Models\Ticket;
use App\Modules\Order\Notifications\TicketsIssuedNotification;
use App\Modules\Admin\Contracts\ActivityLogServiceInterface;
use App\Modules\Admin\Contracts\DailyStatsRecorderServiceInterface;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class OrderFulfillmentService implements OrderFulfillmentServiceInterface
{
    public function __construct(
        private readonly DailyStatsRecorderServiceInterface $statsRecorder,
        private readonly ActivityLogServiceInterface $activityLogs,
        private readonly PromoCodeServiceInterface $promoCodes,
    ) {}

    public function fulfill(Order $order): Order
    {
        $order->loadMissing(['items.ticketType', 'registrations']);

        foreach ($order->items as $item) {
            $ticketType = TicketType::withoutOrganizerScope()
                ->whereKey($item->ticket_type_id)
                ->lockForUpdate()
                ->firstOrFail();

            $ticketType->decrement('reserved_count', $item->quantity);
            $ticketType->increment('sold_count', $item->quantity);
        }

        foreach ($order->registrations as $registration) {
            if ($registration->status === RegistrationStatus::CONFIRMED) {
                continue;
            }

            $registration->fill([
                'status' => RegistrationStatus::CONFIRMED,
                'confirmed_at' => now(),
            ]);
            $registration->save();

            if (! $registration->ticket()->exists()) {
                $this->issueTicket($registration);
            }
        }

        $order->fill([
            'status' => OrderStatus::COMPLETED,
            'paid_at' => $order->paid_at ?? now(),
            'completed_at' => now(),
        ]);
        $order->save();

        $order = $order->fresh(['items', 'registrations.ticket', 'payment', 'event']);

        $this->statsRecorder->recordOrderCompleted($order);

        $this->activityLogs->record(
            action: 'order.completed',
            subjectType: Order::class,
            subjectId: $order->id,
            user: $order->user,
            organizerId: $order->organizer_id,
            properties: [
                'order_number' => $order->order_number,
                'total_amount' => (float) $order->total_amount,
                'event_id' => $order->event_id,
            ],
        );

        $this->sendTicketsEmailIfNeeded($order);

        return $order;
    }

    private function sendTicketsEmailIfNeeded(Order $order): void
    {
        if ($order->status !== OrderStatus::COMPLETED) {
            return;
        }

        $metadata = $order->metadata ?? [];

        if (isset($metadata['tickets_email_sent_at'])) {
            return;
        }

        if ($order->buyer_email === null || $order->buyer_email === '') {
            return;
        }

        Notification::route('mail', $order->buyer_email)
            ->notify(new TicketsIssuedNotification($order));

        $metadata['tickets_email_sent_at'] = now()->toIso8601String();
        $order->fill(['metadata' => $metadata]);
        $order->save();
    }

    public function releaseReservation(Order $order): void
    {
        $order->loadMissing(['items', 'registrations']);

        $this->promoCodes->release($order);

        foreach ($order->items as $item) {
            TicketType::withoutOrganizerScope()
                ->whereKey($item->ticket_type_id)
                ->decrement('reserved_count', $item->quantity);
        }

        foreach ($order->registrations as $registration) {
            if ($registration->status === RegistrationStatus::CANCELLED) {
                continue;
            }

            $registration->fill([
                'status' => RegistrationStatus::CANCELLED,
                'cancelled_at' => now(),
            ]);
            $registration->save();
        }
    }

    private function issueTicket(Registration $registration): void
    {
        $qrToken = Str::random(64);

        Ticket::withoutOrganizerScope()->create([
            'registration_id' => $registration->id,
            'organizer_id' => $registration->organizer_id,
            'event_id' => $registration->event_id,
            'ticket_type_id' => $registration->ticket_type_id,
            'ticket_code' => strtoupper(Str::random(10)),
            'qr_token' => $qrToken,
            'qr_token_hash' => hash('sha256', $qrToken),
            'status' => 'valid',
            'issued_at' => now(),
        ]);
    }
}
