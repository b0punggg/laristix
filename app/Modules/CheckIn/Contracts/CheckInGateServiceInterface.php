<?php

namespace App\Modules\CheckIn\Contracts;

use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckInGate;
use App\Modules\Event\Models\Event;
use Illuminate\Support\Collection;

interface CheckInGateServiceInterface
{
    public function listForEvent(Event $event, User $user): Collection;

    public function listActiveForScanning(Event $event, User $user): Collection;

    public function create(Event $event, User $user, string $name, string $code): CheckInGate;

    public function update(Event $event, User $user, int $gateId, array $attributes): CheckInGate;

    public function delete(Event $event, User $user, int $gateId): void;
}
