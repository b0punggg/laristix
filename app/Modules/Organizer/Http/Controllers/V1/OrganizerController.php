<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\CreateOrganizerServiceInterface;
use App\Modules\Organizer\Contracts\OrganizerServiceInterface;
use App\Modules\Organizer\DTOs\CreateOrganizerDto;
use App\Modules\Organizer\DTOs\UpdateOrganizerDto;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\CreateOrganizerRequest;
use App\Modules\Organizer\Http\Requests\UpdateOrganizerRequest;
use App\Modules\Organizer\Http\Resources\OrganizerResource;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizerController extends Controller
{
    public function __construct(
        private readonly CreateOrganizerServiceInterface $createOrganizerService,
        private readonly OrganizerServiceInterface $organizerService,
        private readonly OrganizerRepositoryInterface $organizers,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function store(CreateOrganizerRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizer = $this->createOrganizerService->create($user, new CreateOrganizerDto(
            name: $request->validated('name'),
            email: $request->validated('email'),
            slug: $request->validated('slug'),
            phone: $request->validated('phone'),
            description: $request->validated('description'),
            website: $request->validated('website'),
            countryCode: $request->validated('country_code'),
            currency: $request->validated('currency'),
            timezone: $request->validated('timezone'),
        ));

        return response()->json([
            'message' => 'Organizer created successfully.',
            'data' => new OrganizerResource($organizer),
        ], 201);
    }

    public function showCurrent(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => new OrganizerResource($this->organizerService->show($organizer, $user)),
        ]);
    }

    public function updateCurrent(UpdateOrganizerRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        $updated = $this->organizerService->update($organizer, $user, new UpdateOrganizerDto(
            name: $request->validated('name'),
            email: $request->validated('email'),
            phone: $request->validated('phone'),
            logoUrl: $request->validated('logo_url'),
            website: $request->validated('website'),
            description: $request->validated('description'),
            countryCode: $request->validated('country_code'),
            currency: $request->validated('currency'),
            timezone: $request->validated('timezone'),
            settings: $request->validated('settings'),
        ));

        return response()->json([
            'message' => 'Organizer updated successfully.',
            'data' => new OrganizerResource($updated),
        ]);
    }

    public function indexPending(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => OrganizerResource::collection($this->organizerService->listPending($user)),
        ]);
    }

    public function approve(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizer = $this->organizers->findByUuid($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        $approved = $this->organizerService->approve($organizer, $user);

        return response()->json([
            'message' => 'Organizer approved successfully.',
            'data' => new OrganizerResource($approved),
        ]);
    }

    private function requireCurrentOrganizer()
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        return $organizer;
    }
}
