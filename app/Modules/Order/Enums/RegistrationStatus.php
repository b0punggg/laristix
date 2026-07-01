<?php

namespace App\Modules\Order\Enums;

final class RegistrationStatus
{
    public const PENDING = 'pending';

    public const CONFIRMED = 'confirmed';

    public const CHECKED_IN = 'checked_in';

    public const CANCELLED = 'cancelled';
}
