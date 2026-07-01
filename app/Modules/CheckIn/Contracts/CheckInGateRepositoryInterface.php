<?php

namespace App\Modules\CheckIn\Contracts;

use App\Modules\CheckIn\Models\CheckInGate;
use Illuminate\Support\Collection;

interface CheckInGateRepositoryInterface
{
    public function listForEvent(int $eventId): Collection;

    public function findForEvent(int $eventId, int $gateId): ?CheckInGate;

    public function create(array $attributes): CheckInGate;

    public function update(CheckInGate $gate, array $attributes): CheckInGate;

    public function delete(CheckInGate $gate): void;

    public function codeExists(int $eventId, string $code, ?int $exceptId = null): bool;
}
