<?php

namespace App\Modules\Order\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Contracts\CheckoutServiceInterface;
use App\Modules\Order\Exceptions\CheckoutException;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckoutQuoteController extends Controller
{
    public function __construct(
        private readonly CheckoutServiceInterface $checkoutService,
    ) {}

    public function show(Request $request, string $eventUuid): JsonResponse
    {
        $validated = $request->validate([
            'ticket_type_id' => ['required', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'promo_code' => ['nullable', 'string', 'max:50'],
        ]);

        $event = Event::withoutOrganizerScope()
            ->where('uuid', $eventUuid)
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', 'public')
            ->first();

        if ($event === null) {
            throw CheckoutException::make('Event is not available for checkout.', 404);
        }

        $ticketType = TicketType::withoutOrganizerScope()
            ->whereKey((int) $validated['ticket_type_id'])
            ->where('event_id', $event->id)
            ->first();

        if ($ticketType === null) {
            throw CheckoutException::make('Ticket type not found for this event.', 404);
        }

        $quote = $this->checkoutService->quote(
            $event,
            $ticketType,
            (int) $validated['quantity'],
            $validated['promo_code'] ?? null,
        );

        return response()->json(['data' => $quote]);
    }
}
