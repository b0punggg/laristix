<?php

namespace App\Modules\Order\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Order\Contracts\CheckoutServiceInterface;
use App\Modules\Order\Http\Resources\OrderResource;
use App\Modules\Payment\Contracts\TransactionValidationServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PublicOrderController extends Controller
{
    public function __construct(
        private readonly CheckoutServiceInterface $checkoutService,
        private readonly TransactionValidationServiceInterface $validationService,
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $perPage = (int) config('order_module.pagination.my_orders_per_page', 15);

        $orders = $this->checkoutService->listForUser(request()->user()->id, $perPage);

        return OrderResource::collection($orders);
    }

    public function show(string $uuid): JsonResponse
    {
        $order = $this->checkoutService->showForUser($uuid, request()->user()->id);

        return response()->json([
            'data' => new OrderResource($order),
        ]);
    }

    public function validatePayment(string $uuid): JsonResponse
    {
        $order = $this->checkoutService->showForUser($uuid, request()->user()->id);
        $result = $this->validationService->validateOrderPayment($order);

        return response()->json([
            'data' => $result,
            'order' => new OrderResource($this->checkoutService->showForUser($uuid, request()->user()->id)),
        ]);
    }
}
