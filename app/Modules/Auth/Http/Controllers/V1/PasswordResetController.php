<?php

namespace App\Modules\Auth\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Contracts\PasswordResetServiceInterface;
use App\Modules\Auth\DTOs\ForgotPasswordDto;
use App\Modules\Auth\DTOs\ResetPasswordDto;
use App\Modules\Auth\Http\Requests\ForgotPasswordRequest;
use App\Modules\Auth\Http\Requests\ResetPasswordRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

class PasswordResetController extends Controller
{
    public function __construct(
        private readonly PasswordResetServiceInterface $passwordResetService,
    ) {}

    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        $status = $this->passwordResetService->sendResetLink(
            new ForgotPasswordDto(email: $request->validated('email'))
        );

        if ($status !== Password::RESET_LINK_SENT) {
            // Always return success to prevent email enumeration
            return response()->json([
                'message' => 'If that email address exists, a reset link has been sent.',
            ]);
        }

        return response()->json([
            'message' => 'If that email address exists, a reset link has been sent.',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = $this->passwordResetService->resetPassword(new ResetPasswordDto(
            email: $request->validated('email'),
            password: $request->validated('password'),
            passwordConfirmation: $request->validated('password_confirmation'),
            token: $request->validated('token'),
        ));

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Unable to reset password. The token may be invalid or expired.',
                'error_code' => 'PASSWORD_RESET_FAILED',
            ], 422);
        }

        return response()->json([
            'message' => 'Password has been reset successfully.',
        ]);
    }
}
