<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\VenueServiceInterface;
use App\Modules\Event\DTOs\CreateVenueDto;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Http\Requests\CreateVenueRequest;
use App\Modules\Event\Http\Resources\VenueResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VenueController extends Controller
{
    public function __construct(
        private readonly VenueServiceInterface $venueService,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => VenueResource::collection(
                $this->venueService->list($this->requireOrganizer(), $user)
            ),
        ]);
    }

    public function store(CreateVenueRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $venue = $this->venueService->create($this->requireOrganizer(), $user, new CreateVenueDto(
            name: $request->validated('name'),
            type: $request->validated('type') ?? 'physical',
            address: $request->validated('address'),
            city: $request->validated('city'),
            province: $request->validated('province'),
            countryCode: $request->validated('country_code'),
            postalCode: $request->validated('postal_code'),
            latitude: $request->validated('latitude') !== null ? (float) $request->validated('latitude') : null,
            longitude: $request->validated('longitude') !== null ? (float) $request->validated('longitude') : null,
            onlineUrl: $request->validated('online_url'),
            capacity: $request->validated('capacity'),
        ));

        return response()->json([
            'message' => 'Venue created successfully.',
            'data' => new VenueResource($venue),
        ], 201);
    }

    public function destroy(Request $request, int $venueId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->venueService->delete($this->requireOrganizer(), $user, $venueId);

        return response()->json([
            'message' => 'Venue deleted successfully.',
        ]);
    }

    private function requireOrganizer()
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw EventNotFoundException::make();
        }

        return $organizer;
    }
}
