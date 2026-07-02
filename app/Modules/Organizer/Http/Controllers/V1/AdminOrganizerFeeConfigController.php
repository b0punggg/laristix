<?php

namespace App\Modules\Organizer\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Contracts\OrganizerFeeConfigServiceInterface;
use App\Modules\Organizer\DTOs\StoreOrganizerFeeConfigDto;
use App\Modules\Organizer\DTOs\UpdateOrganizerFeeConfigDto;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use App\Modules\Organizer\Http\Requests\StoreOrganizerFeeConfigRequest;
use App\Modules\Organizer\Http\Requests\UpdateOrganizerFeeConfigRequest;
use App\Modules\Organizer\Http\Resources\OrganizerFeeConfigResource;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminOrganizerFeeConfigController extends Controller
{
    public function __construct(
        private readonly OrganizerFeeConfigServiceInterface $feeConfigs,
        private readonly OrganizerRepositoryInterface $organizers,
    ) {}

    public function index(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer($uuid);

        return response()->json([
            'data' => OrganizerFeeConfigResource::collection(
                $this->feeConfigs->listForOrganizer($organizer, $user)
            ),
        ]);
    }

    public function store(StoreOrganizerFeeConfigRequest $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer($uuid);

        $config = $this->feeConfigs->create($organizer, $user, new StoreOrganizerFeeConfigDto(
            feeType: $request->validated('fee_type'),
            percentageRate: (float) $request->validated('percentage_rate'),
            flatAmount: (float) $request->validated('flat_amount'),
            feeBearer: $request->validated('fee_bearer'),
            effectiveFrom: $request->validated('effective_from'),
            effectiveUntil: $request->validated('effective_until'),
            notes: $request->validated('notes'),
        ));

        return response()->json([
            'message' => 'Fee config created successfully.',
            'data' => new OrganizerFeeConfigResource($config->load('createdBy:id,name,email')),
        ], 201);
    }

    public function update(
        UpdateOrganizerFeeConfigRequest $request,
        string $uuid,
        int $feeConfigId,
    ): JsonResponse {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer($uuid);
        $config = $this->requireFeeConfig($organizer->id, $feeConfigId);

        $updated = $this->feeConfigs->update($config, $user, new UpdateOrganizerFeeConfigDto(
            feeType: $request->validated('fee_type'),
            percentageRate: $request->has('percentage_rate')
                ? (float) $request->validated('percentage_rate')
                : null,
            flatAmount: $request->has('flat_amount')
                ? (float) $request->validated('flat_amount')
                : null,
            feeBearer: $request->validated('fee_bearer'),
            effectiveFrom: $request->validated('effective_from'),
            effectiveUntil: $request->validated('effective_until'),
            notes: $request->validated('notes'),
        ));

        return response()->json([
            'message' => 'Fee config updated successfully.',
            'data' => new OrganizerFeeConfigResource($updated),
        ]);
    }

    public function destroy(Request $request, string $uuid, int $feeConfigId): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireOrganizer($uuid);
        $config = $this->requireFeeConfig($organizer->id, $feeConfigId);

        $this->feeConfigs->delete($config, $user);

        return response()->json([
            'message' => 'Fee config deleted successfully.',
        ]);
    }

    private function requireOrganizer(string $uuid)
    {
        $organizer = $this->organizers->findByUuid($uuid);

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        return $organizer;
    }

    private function requireFeeConfig(int $organizerId, int $feeConfigId): OrganizerFeeConfig
    {
        $config = OrganizerFeeConfig::query()
            ->where('organizer_id', $organizerId)
            ->where('id', $feeConfigId)
            ->first();

        if ($config === null) {
            throw OrganizerAccessDeniedException::make('Fee config not found.');
        }

        return $config;
    }
}
