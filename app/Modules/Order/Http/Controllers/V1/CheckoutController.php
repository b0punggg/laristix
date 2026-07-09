<?php

namespace App\Modules\Order\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Order\Contracts\CheckoutServiceInterface;
use App\Modules\Order\DTOs\CreateCheckoutDto;
use App\Modules\Order\Http\Requests\CreateCheckoutRequest;
use App\Modules\Order\Http\Resources\CheckoutResource;
use App\Modules\Order\Http\Resources\OrderResource;
use Illuminate\Http\JsonResponse;

class CheckoutController extends Controller
{
    public function __construct(
        private readonly CheckoutServiceInterface $checkoutService,
    ) {}

    public function store(CreateCheckoutRequest $request, string $eventUuid): JsonResponse
    {
        $user = $request->user();

        $result = $this->checkoutService->checkout(new CreateCheckoutDto(
            eventUuid: $eventUuid,
            ticketTypeId: (int) $request->validated('ticket_type_id'),
            quantity: (int) $request->validated('quantity'),
            buyerName: $request->validated('buyer_name'),
            buyerEmail: $request->validated('buyer_email'),
            buyerPhone: $request->validated('buyer_phone'),
            buyerIdNumber: $request->validated('buyer_id_number'),
            buyerDateOfBirth: $request->validated('buyer_date_of_birth'),
            buyerGender: $request->validated('buyer_gender'),
            userId: $user->id,
            idempotencyKey: $request->header('Idempotency-Key'),
            ipAddress: $request->ip(),
            userAgent: $request->userAgent(),
            answers: $request->validated('answers') ?? [],
            attendees: $request->validated('attendees') ?? [],
            promoCode: $request->validated('promo_code'),
        ));

        return (new CheckoutResource($result))
            ->response()
            ->setStatusCode(201);
    }
}
