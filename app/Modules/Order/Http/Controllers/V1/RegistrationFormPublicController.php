<?php

namespace App\Modules\Order\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Http\Resources\RegistrationFormResource;
use App\Modules\Order\Services\RegistrationFormService;
use Illuminate\Http\JsonResponse;

class RegistrationFormPublicController extends Controller
{
    public function __construct(
        private readonly RegistrationFormService $registrationForms,
    ) {}

    public function show(string $eventUuid): JsonResponse
    {
        $event = Event::withoutOrganizerScope()
            ->where('uuid', $eventUuid)
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', 'public')
            ->first();

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return response()->json([
            'data' => new RegistrationFormResource($this->registrationForms->showPublic($event)),
        ]);
    }
}
