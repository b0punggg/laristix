<?php

namespace App\Modules\Order\Contracts;

use App\Modules\Order\Models\Order;

interface OrderFulfillmentServiceInterface
{
    public function fulfill(Order $order): Order;

    public function releaseReservation(Order $order): void;
}
