<?php

namespace App\Modules\Admin\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use App\Modules\Admin\Http\Requests\UpdatePlatformSettingRequest;
use App\Modules\Admin\Http\Resources\PlatformSettingResource;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformSettingController extends Controller
{
    public function __construct(
        private readonly PlatformSettingServiceInterface $settings,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'data' => PlatformSettingResource::collection($this->settings->listAll($user)),
        ]);
    }

    public function update(UpdatePlatformSettingRequest $request, string $key): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $updated = $this->settings->update($user, $key, $request->validated('value'));

        return response()->json([
            'message' => 'Platform setting updated successfully.',
            'data' => new PlatformSettingResource($updated),
        ]);
    }
}
