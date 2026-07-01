<?php

namespace App\Modules\Order\Repositories\Eloquent;

use App\Modules\Order\Models\Order;
use App\Modules\Order\Repositories\Contracts\OrderRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class OrderRepository implements OrderRepositoryInterface
{
    public function findByUuid(string $uuid): ?Order
    {
        return Order::withoutOrganizerScope()
            ->with(['items.ticketType', 'payment', 'registrations.ticket', 'event', 'organizer'])
            ->where('uuid', $uuid)
            ->first();
    }

    public function findByIdempotencyKey(string $key): ?Order
    {
        return Order::withoutOrganizerScope()
            ->with(['items', 'payment'])
            ->where('idempotency_key', $key)
            ->first();
    }

    public function findByOrderNumber(string $orderNumber): ?Order
    {
        return Order::withoutOrganizerScope()
            ->with(['items', 'payment', 'registrations'])
            ->where('order_number', $orderNumber)
            ->first();
    }

    public function create(array $attributes): Order
    {
        return Order::withoutOrganizerScope()->create($attributes);
    }

    public function update(Order $order, array $attributes): Order
    {
        $order->fill($attributes);
        $order->save();

        return $order->fresh();
    }

    public function lockForUpdate(Order $order): Order
    {
        return Order::withoutOrganizerScope()
            ->whereKey($order->id)
            ->lockForUpdate()
            ->firstOrFail();
    }

    public function paginateForUser(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        return Order::withoutOrganizerScope()
            ->with(['items', 'payment', 'registrations.ticket', 'event'])
            ->where('user_id', $userId)
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }
}
