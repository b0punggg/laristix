<?php

namespace App\Modules\Admin\Contracts;

use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Order\Models\Order;

interface DailyStatsRecorderServiceInterface
{
    public function recordOrderCompleted(Order $order): void;

    public function recordCheckIn(CheckIn $checkIn): void;
}
