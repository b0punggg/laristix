<?php

namespace App\Modules\Payment\Contracts;

use App\Modules\Order\Models\Order;
use App\Modules\Payment\Models\Payment;

interface MidtransSnapServiceInterface
{
    public function initiate(Order $order): Payment;
}
