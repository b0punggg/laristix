<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerMemberServiceInterface;
use App\Modules\Organizer\DTOs\InviteOrganizerMemberDto;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\InviteOrganizerMemberRequest;
use App\Modules\Organizer\Http\Requests\UpdateOrganizerMemberRequest;
use App\Modules\Organizer\Http\Resources\OrganizerMemberResource;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizerMemberController extends Controller
{
    public function __construct(
        private readonly OrganizerMemberServiceInterface $memberService,
        private readonly OrganizerMemberRepositoryInterface $members,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => OrganizerMemberResource::collection($this->memberService->list($organizer, $user)),
        ]);
    }

    public function store(InviteOrganizerMemberRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        $member = $this->memberService->invite($organizer, $user, new InviteOrganizerMemberDto(
            email: $request->validated('email'),
            role: $request->validated('role'),
        ));

        return response()->json([
            'message' => 'Member invitation sent.',
            'data' => new OrganizerMemberResource($member->load(['user', 'invitedBy'])),
        ], 201);
    }

    public function update(UpdateOrganizerMemberRequest $request, int $memberId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        $member = $this->members->findForOrganizer($organizer->id, $memberId);

        if ($member === null) {
            throw OrganizerNotFoundException::make();
        }

        $updated = $this->memberService->update(
            $organizer,
            $user,
            $member,
            $request->validated('role'),
            $request->validated('status'),
        );

        return response()->json([
            'message' => 'Member updated successfully.',
            'data' => new OrganizerMemberResource($updated),
        ]);
    }

    public function destroy(Request $request, int $memberId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        $member = $this->members->findForOrganizer($organizer->id, $memberId);

        if ($member === null) {
            throw OrganizerNotFoundException::make();
        }

        $this->memberService->remove($organizer, $user, $member);

        return response()->json([
            'message' => 'Member removed successfully.',
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
