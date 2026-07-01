<?php

namespace App\Modules\Payment\Contracts;

use App\Modules\Order\Models\Order;

interface TransactionValidationServiceInterface
{
    /**
     * @return array{valid: bool, payment_status: string, order_status: string, message: string}
     */
    public function validateOrderPayment(Order $order): array;
}
