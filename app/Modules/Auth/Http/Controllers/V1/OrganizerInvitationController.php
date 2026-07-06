<?php

namespace App\Modules\Auth\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\ActiveOrganizerServiceInterface;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Http\Resources\MeResource;
use App\Modules\Auth\Http\Resources\OrganizerInvitationResource;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerMemberServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizerInvitationController extends Controller
{
    public function __construct(
        private readonly OrganizerMemberServiceInterface $memberService,
        private readonly ActiveOrganizerServiceInterface $activeOrganizerService,
        private readonly OrganizerMembershipValidatorInterface $membershipValidator,
        private readonly OrganizerContextInterface $organizerContext,
        private readonly AuthServiceInterface $authService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => OrganizerInvitationResource::collection(
                $this->memberService->listPendingInvitations($user)
            ),
        ]);
    }

    public function accept(Request $request, int $memberId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $member = $this->memberService->acceptInvitation($user, $memberId);
        $organizer = $this->activeOrganizerService->switch($user, $member->organizer_id);
        $membership = $this->membershipValidator->validateMembership($user, $organizer->id);

        $this->organizerContext->set($organizer, $user, $membership);

        return response()->json([
            'message' => 'Undangan diterima. Anda sekarang bergabung dengan '.$organizer->name.'.',
            'data' => new MeResource($this->authService->currentUser($user)),
        ]);
    }

    public function decline(Request $request, int $memberId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $this->memberService->declineInvitation($user, $memberId);

        return response()->json([
            'message' => 'Undangan ditolak.',
        ]);
    }
}
