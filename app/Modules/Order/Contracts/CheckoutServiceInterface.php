<?php

namespace App\Modules\Order\Contracts;

use App\Modules\Order\DTOs\CreateCheckoutDto;
use App\Modules\Order\Models\Order;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CheckoutServiceInterface
{
    /**
     * @return array{order: Order, snap_token: string|null, client_key: string|null}
     */
    public function checkout(CreateCheckoutDto $dto): array;

    public function showPublic(string $uuid): Order;

    public function showForUser(string $uuid, int $userId): Order;

    public function listForUser(int $userId, int $perPage = 15): LengthAwarePaginator;
}
