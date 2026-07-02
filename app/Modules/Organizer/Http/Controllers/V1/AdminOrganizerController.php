<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerServiceInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\AdminListOrganizersRequest;
use App\Modules\Organizer\Http\Resources\AdminOrganizerResource;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrganizerController extends Controller
{
    public function __construct(
        private readonly OrganizerServiceInterface $organizerService,
        private readonly OrganizerRepositoryInterface $organizers,
    ) {}

    public function index(AdminListOrganizersRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $paginator = $this->organizerService->listForPlatform(
            $user,
            $request->validated(),
            (int) config('organizer_module.pagination.admin_per_page', 15)
        );

        return AdminOrganizerResource::collection($paginator)->response();
    }

    public function show(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizer = $this->organizers->findByUuidForAdmin($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        return response()->json([
            'data' => new AdminOrganizerResource(
                $this->organizerService->showForPlatform($user, $organizer)
            ),
        ]);
    }

    public function suspend(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizer = $this->organizers->findByUuid($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        $updated = $this->organizerService->suspend($organizer, $user);

        return response()->json([
            'message' => 'Organizer suspended successfully.',
            'data' => new AdminOrganizerResource($updated),
        ]);
    }

    public function activate(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizer = $this->organizers->findByUuid($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        $updated = $this->organizerService->activate($organizer, $user);

        return response()->json([
            'message' => 'Organizer activated successfully.',
            'data' => new AdminOrganizerResource($updated),
        ]);
    }

    public function reject(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizer = $this->organizers->findByUuid($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        $updated = $this->organizerService->reject($organizer, $user);

        return response()->json([
            'message' => 'Organizer registration rejected.',
            'data' => new AdminOrganizerResource($updated),
        ]);
    }
}
