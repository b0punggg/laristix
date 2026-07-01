<?php

namespace App\Modules\CheckIn\Services;

use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Contracts\CheckInGateRepositoryInterface;
use App\Modules\CheckIn\Contracts\CheckInGateServiceInterface;
use App\Modules\CheckIn\Exceptions\CheckInAccessDeniedException;
use App\Modules\CheckIn\Exceptions\CheckInException;
use App\Modules\CheckIn\Models\CheckInGate;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class CheckInGateService implements CheckInGateServiceInterface
{
    public function __construct(
        private readonly CheckInGateRepositoryInterface $gates,
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    /** @var list<string> */
    private const SCAN_ROLES = [
        OrganizerMemberRole::OWNER,
        OrganizerMemberRole::ADMIN,
        OrganizerMemberRole::STAFF,
        OrganizerMemberRole::SCANNER,
    ];

    public function listForEvent(Event $event, User $user): Collection
    {
        $this->assertCanManageGates($event->organizer, $user);

        return $this->gates->listForEvent($event->id);
    }

    public function listActiveForScanning(Event $event, User $user): Collection
    {
        $this->assertCanScan($event->organizer, $user);

        return $this->gates->listForEvent($event->id)->where('is_active', true)->values();
    }

    public function create(Event $event, User $user, string $name, string $code): CheckInGate
    {
        $this->assertCanManageGates($event->organizer, $user);

        $normalizedCode = Str::upper(Str::slug($code, ''));

        if ($normalizedCode === '') {
            throw CheckInException::make('Gate code is required.');
        }

        if ($this->gates->codeExists($event->id, $normalizedCode)) {
            throw CheckInException::make('Gate code already exists for this event.');
        }

        return $this->gates->create([
            'event_id' => $event->id,
            'organizer_id' => $event->organizer_id,
            'name' => $name,
            'code' => $normalizedCode,
            'is_active' => true,
        ]);
    }

    public function update(Event $event, User $user, int $gateId, array $attributes): CheckInGate
    {
        $this->assertCanManageGates($event->organizer, $user);

        $gate = $this->gates->findForEvent($event->id, $gateId);

        if ($gate === null) {
            throw CheckInException::make('Gate not found.', 404);
        }

        if (isset($attributes['code'])) {
            $normalizedCode = Str::upper(Str::slug((string) $attributes['code'], ''));

            if ($this->gates->codeExists($event->id, $normalizedCode, $gate->id)) {
                throw CheckInException::make('Gate code already exists for this event.');
            }

            $attributes['code'] = $normalizedCode;
        }

        return $this->gates->update($gate, $attributes);
    }

    public function delete(Event $event, User $user, int $gateId): void
    {
        $this->assertCanManageGates($event->organizer, $user);

        $gate = $this->gates->findForEvent($event->id, $gateId);

        if ($gate === null) {
            throw CheckInException::make('Gate not found.', 404);
        }

        $this->gates->delete($gate);
    }

    private function assertCanManageGates(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! in_array($membership->role, OrganizerMemberRole::managers(), true)) {
            throw CheckInAccessDeniedException::denied('Only organizers can manage check-in gates.');
        }
    }

    private function assertCanScan(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership === null || ! in_array($membership->role, self::SCAN_ROLES, true)) {
            throw CheckInAccessDeniedException::denied();
        }
    }
}
