<?php

namespace App\Modules\Auth\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Contracts\RegisterUserServiceInterface;
use App\Modules\Auth\DTOs\LoginDto;
use App\Modules\Auth\DTOs\RegisterUserDto;
use App\Modules\Auth\Http\Requests\LoginRequest;
use App\Modules\Auth\Http\Requests\RegisterRequest;
use App\Modules\Auth\Http\Resources\MeResource;
use App\Modules\Auth\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly RegisterUserServiceInterface $registerService,
        private readonly AuthServiceInterface $authService,
    ) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $user = $this->registerService->register(new RegisterUserDto(
            name: $request->validated('name'),
            email: $request->validated('email'),
            password: $request->validated('password'),
            phone: $request->validated('phone'),
        ));

        return response()->json([
            'message' => 'Registration successful. Please verify your email address.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $user = $this->authService->login(new LoginDto(
            email: $request->validated('email'),
            password: $request->validated('password'),
            remember: $request->boolean('remember'),
        ));

        $me = $this->authService->currentUser($user);

        return response()->json([
            'message' => 'Login successful.',
            'data' => new MeResource($me),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        /** @var \App\Modules\Auth\Models\User $user */
        $user = $request->user();

        $this->authService->logout($user);

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
