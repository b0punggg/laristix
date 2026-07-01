<?php

namespace App\Modules\Order\Enums;

final class TicketStatus
{
    public const VALID = 'valid';

    public const USED = 'used';

    public const CANCELLED = 'cancelled';

    public const EXPIRED = 'expired';
}
