<?php

namespace App\Modules\Order\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Order\Http\Requests\SyncRegistrationFieldsRequest;
use App\Modules\Order\Http\Resources\RegistrationFormResource;
use App\Modules\Order\Services\RegistrationFormService;
use Illuminate\Http\JsonResponse;

class RegistrationFormManagementController extends Controller
{
    public function __construct(
        private readonly RegistrationFormService $registrationForms,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function show(string $eventUuid): JsonResponse
    {
        $event = $this->findEventOrFail($eventUuid);
        $form = $this->registrationForms->showForOrganizer($event, request()->user());

        return response()->json([
            'data' => new RegistrationFormResource($form),
        ]);
    }

    public function syncFields(SyncRegistrationFieldsRequest $request, string $eventUuid): JsonResponse
    {
        $event = $this->findEventOrFail($eventUuid);
        $form = $this->registrationForms->syncFields(
            $event,
            $request->user(),
            $request->validated('fields')
        );

        return response()->json([
            'message' => 'Registration fields updated successfully.',
            'data' => new RegistrationFormResource($form),
        ]);
    }

    private function findEventOrFail(string $uuid)
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw EventNotFoundException::make();
        }

        $event = $this->events->findByUuidForOrganizer($uuid, $organizer->id);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
    }
}
