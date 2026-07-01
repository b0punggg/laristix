<?php

namespace App\Modules\CheckIn\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Contracts\CheckInGateServiceInterface;
use App\Modules\CheckIn\Contracts\CheckInRepositoryInterface;
use App\Modules\CheckIn\Contracts\CheckInServiceInterface;
use App\Modules\CheckIn\Http\Requests\ManualCheckInRequest;
use App\Modules\CheckIn\Http\Requests\ScanCheckInRequest;
use App\Modules\CheckIn\Http\Requests\StoreCheckInGateRequest;
use App\Modules\CheckIn\Http\Requests\UpdateCheckInGateRequest;
use App\Modules\CheckIn\Http\Requests\VerifyCheckInRequest;
use App\Modules\CheckIn\Http\Resources\CheckInGateResource;
use App\Modules\CheckIn\Http\Resources\CheckInResource;
use App\Modules\CheckIn\Exceptions\TicketNotFoundException;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CheckInController extends Controller
{
    public function __construct(
        private readonly CheckInServiceInterface $checkInService,
        private readonly CheckInGateServiceInterface $gateService,
        private readonly EventRepositoryInterface $events,
        private readonly CheckInRepositoryInterface $checkIns,
    ) {}

    public function verify(VerifyCheckInRequest $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $result = $this->checkInService->verify($event, $user, $request->validated('qr_token'));

        return response()->json(['data' => $result]);
    }

    public function scan(ScanCheckInRequest $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $checkIn = $this->checkInService->scanByQr(
            $event,
            $user,
            $request->validated('qr_token'),
            $request->validated('gate_id'),
            $request->validated('device_info'),
        );

        return response()->json([
            'message' => 'Check-in successful.',
            'data' => new CheckInResource($checkIn),
        ]);
    }

    public function manual(ManualCheckInRequest $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $checkIn = $this->checkInService->checkInManual(
            $event,
            $user,
            $request->validated('ticket_code'),
            $request->validated('gate_id'),
            $request->validated('device_info'),
        );

        return response()->json([
            'message' => 'Manual check-in successful.',
            'data' => new CheckInResource($checkIn),
        ]);
    }

    public function index(string $eventUuid): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);
        $perPage = (int) config('check_in_module.pagination.check_ins_per_page', 20);

        $checkIns = $this->checkInService->listForEvent($event, $user, $perPage);

        return CheckInResource::collection($checkIns);
    }

    public function stats(string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);

        return response()->json([
            'data' => $this->checkInService->statsForEvent($event, $user),
        ]);
    }

    public function gatesIndex(string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);

        return response()->json([
            'data' => CheckInGateResource::collection($this->gateService->listForEvent($event, $user)),
        ]);
    }

    public function scanGates(string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);

        return response()->json([
            'data' => CheckInGateResource::collection($this->gateService->listActiveForScanning($event, $user)),
        ]);
    }

    public function gatesStore(StoreCheckInGateRequest $request, string $eventUuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $gate = $this->gateService->create(
            $event,
            $user,
            $request->validated('name'),
            $request->validated('code'),
        );

        return response()->json([
            'message' => 'Check-in gate created.',
            'data' => new CheckInGateResource($gate),
        ], 201);
    }

    public function gatesUpdate(UpdateCheckInGateRequest $request, string $eventUuid, int $gateId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $event = $this->findEventOrFail($eventUuid);

        $gate = $this->gateService->update($event, $user, $gateId, $request->validated());

        return response()->json([
            'message' => 'Check-in gate updated.',
            'data' => new CheckInGateResource($gate),
        ]);
    }

    public function gatesDestroy(string $eventUuid, int $gateId): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();
        $event = $this->findEventOrFail($eventUuid);

        $this->gateService->delete($event, $user, $gateId);

        return response()->json([
            'message' => 'Check-in gate deleted.',
        ]);
    }

    public function ticketQr(string $ticketUuid): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();

        $ticket = $this->checkIns->findTicketForUser($ticketUuid, $user->id);

        if ($ticket === null) {
            throw TicketNotFoundException::notFound();
        }

        return response()->json([
            'data' => $this->checkInService->qrPayloadForTicket($ticket, $user),
        ]);
    }

    private function findEventOrFail(string $eventUuid)
    {
        $event = $this->events->findByUuid($eventUuid);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
    }
}
