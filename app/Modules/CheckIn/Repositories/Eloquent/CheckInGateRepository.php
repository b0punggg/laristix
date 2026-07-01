<?php

namespace App\Modules\CheckIn\Repositories\Eloquent;

use App\Modules\CheckIn\Contracts\CheckInGateRepositoryInterface;
use App\Modules\CheckIn\Models\CheckInGate;
use Illuminate\Support\Collection;

class CheckInGateRepository implements CheckInGateRepositoryInterface
{
    public function listForEvent(int $eventId): Collection
    {
        return CheckInGate::query()
            ->where('event_id', $eventId)
            ->orderBy('name')
            ->get();
    }

    public function findForEvent(int $eventId, int $gateId): ?CheckInGate
    {
        return CheckInGate::query()
            ->where('event_id', $eventId)
            ->whereKey($gateId)
            ->first();
    }

    public function create(array $attributes): CheckInGate
    {
        return CheckInGate::query()->create($attributes);
    }

    public function update(CheckInGate $gate, array $attributes): CheckInGate
    {
        $gate->fill($attributes);
        $gate->save();

        return $gate->fresh();
    }

    public function delete(CheckInGate $gate): void
    {
        $gate->delete();
    }

    public function codeExists(int $eventId, string $code, ?int $exceptId = null): bool
    {
        $query = CheckInGate::query()
            ->where('event_id', $eventId)
            ->where('code', $code);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }
}
