<?php

namespace App\Modules\Payment\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Payment\Contracts\PaymentWebhookServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MidtransWebhookController extends Controller
{
    public function __construct(
        private readonly PaymentWebhookServiceInterface $webhookService,
    ) {}

    public function handle(Request $request): JsonResponse
    {
        /** @var array<string, mixed> $payload */
        $payload = $request->all();

        $result = $this->webhookService->handleMidtransNotification($payload, $request->ip());

        return response()->json($result);
    }
}
