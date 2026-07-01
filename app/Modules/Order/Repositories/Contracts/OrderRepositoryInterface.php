<?php

namespace App\Modules\Order\Repositories\Contracts;

use App\Modules\Order\Models\Order;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface OrderRepositoryInterface
{
    public function findByUuid(string $uuid): ?Order;

    public function findByIdempotencyKey(string $key): ?Order;

    public function findByOrderNumber(string $orderNumber): ?Order;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function create(array $attributes): Order;

    /**
     * @param  array<string, mixed>  $attributes
     */
    public function update(Order $order, array $attributes): Order;

    public function lockForUpdate(Order $order): Order;

    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator;
}
