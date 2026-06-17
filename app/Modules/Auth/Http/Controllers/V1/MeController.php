<?php

namespace App\Modules\Auth\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\DTOs\SwitchOrganizerDto;
use App\Modules\Auth\Http\Requests\SwitchOrganizerRequest;
use App\Modules\Auth\Http\Resources\MeResource;
use App\Modules\Auth\Http\Resources\OrganizerSummaryResource;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MeController extends Controller
{
    public function __construct(
        private readonly AuthServiceInterface $authService,
        private readonly ActiveOrganizerServiceInterface $activeOrganizerService,
        private readonly OrganizerContextInterface $organizerContext,
        private readonly OrganizerMembershipValidatorInterface $membershipValidator,
    ) {}

    public function show(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => new MeResource($this->authService->currentUser($user)),
        ]);
    }

    public function organizers(Request $request): AnonymousResourceCollection
    {
        /** @var User $user */
        $user = $request->user();

        return OrganizerSummaryResource::collection(
            $this->activeOrganizerService->getAvailableOrganizers($user)
        );
    }

    public function switchOrganizer(SwitchOrganizerRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $organizerId = (int) $request->validated('organizer_id');

        $organizer = $this->activeOrganizerService->switch($user, $organizerId);
        $membership = $this->membershipValidator->validateMembership($user, $organizerId);

        $this->organizerContext->set($organizer, $user, $membership);

        return response()->json([
            'message' => 'Active organizer switched successfully.',
            'data' => new MeResource($this->authService->currentUser($user)),
        ]);
    }
}
