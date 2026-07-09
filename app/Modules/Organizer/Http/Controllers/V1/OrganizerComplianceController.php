<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\SubmitOrganizerComplianceRequest;
use App\Modules\Organizer\Http\Resources\OrganizerResource;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use App\Modules\Organizer\Services\OrganizerComplianceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrganizerComplianceController extends Controller
{
    public function __construct(
        private readonly OrganizerComplianceService $complianceService,
        private readonly OrganizerRepositoryInterface $organizers,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function showCurrent(Request $request): JsonResponse
    {
        $organizer = $this->requireCurrentOrganizer();

        return response()->json([
            'data' => $this->complianceService->getProfile($organizer),
        ]);
    }

    public function submitCurrent(SubmitOrganizerComplianceRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();

        $updated = $this->complianceService->submit($organizer, $user, $request->validated());

        return response()->json([
            'message' => 'Data verifikasi berhasil dikirim.',
            'data' => $this->complianceService->getProfile($updated),
        ]);
    }

    public function verify(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->organizers->findByUuid($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        $updated = $this->complianceService->verify($organizer, $user);

        return response()->json([
            'message' => 'Compliance verified successfully.',
            'data' => new OrganizerResource($updated),
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

        $updated = $this->complianceService->reject(
            $organizer,
            $user,
            $request->input('reason')
        );

        return response()->json([
            'message' => 'Compliance rejected.',
            'data' => new OrganizerResource($updated),
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
