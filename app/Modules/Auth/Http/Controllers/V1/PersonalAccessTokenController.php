<?php

namespace App\Modules\Auth\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Contracts\PersonalAccessTokenServiceInterface;
use App\Modules\Auth\Http\Requests\CreateTokenRequest;
use App\Modules\Auth\Http\Resources\PersonalAccessTokenResource;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Laravel\Sanctum\NewAccessToken;

class PersonalAccessTokenController extends Controller
{
    public function __construct(
        private readonly PersonalAccessTokenServiceInterface $tokenService,
    ) {}

    public function store(CreateTokenRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $type = $request->validated('type', 'scanner');
        $deviceName = $request->validated('device_name');

        $tokenResult = $type === 'scanner'
            ? $this->tokenService->createScannerToken($user, $deviceName)
            : $this->tokenService->createToken(
                $user,
                $deviceName,
                config('auth_module.token.default_abilities', ['*']),
                now()->addDays((int) config('auth_module.token.default_expiry_days', 90)),
            );

        return response()->json([
            'message' => 'Token created successfully.',
            'data' => $this->formatTokenResponse($tokenResult),
        ], 201);
    }

    public function destroy(): JsonResponse
    {
        /** @var User $user */
        $user = request()->user();

        $this->tokenService->revokeCurrentToken($user);

        return response()->json(null, 204);
    }

    /**
     * @return array<string, mixed>
     */
    private function formatTokenResponse(NewAccessToken $tokenResult): array
    {
        return [
            'plain_text_token' => $tokenResult->plainTextToken,
            'access_token' => new PersonalAccessTokenResource($tokenResult->accessToken),
        ];
    }
}
