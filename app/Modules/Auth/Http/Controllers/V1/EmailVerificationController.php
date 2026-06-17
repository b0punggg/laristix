<?php

namespace App\Modules\Auth\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Contracts\EmailVerificationServiceInterface;
use App\Modules\Auth\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function __construct(
        private readonly EmailVerificationServiceInterface $emailVerification,
    ) {}

    public function notice(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email already verified.',
            ]);
        }

        $this->emailVerification->sendVerificationNotification($user);

        return response()->json([
            'message' => 'Verification link sent.',
        ]);
    }

    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        $user = User::query()->findOrFail($id);

        $this->emailVerification->markVerified($user, $id, $hash);

        return response()->json([
            'message' => 'Email verified successfully.',
        ]);
    }
}
