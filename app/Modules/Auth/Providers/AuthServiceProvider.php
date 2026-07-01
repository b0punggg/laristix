<?php

namespace App\Modules\Auth\Providers;

use App\Modules\Auth\Contracts\AuthServiceInterface;
use App\Modules\Auth\Contracts\EmailVerificationServiceInterface;
use App\Modules\Auth\Contracts\PasswordResetServiceInterface;
use App\Modules\Auth\Contracts\PersonalAccessTokenServiceInterface;
use App\Modules\Auth\Contracts\RegisterUserServiceInterface;
use App\Modules\Auth\Contracts\RoleServiceInterface;
use App\Modules\Auth\Contracts\UserRoleResolverInterface;
use App\Modules\Auth\Repositories\Contracts\RoleRepositoryInterface;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;
use App\Modules\Auth\Repositories\Eloquent\RoleRepository;
use App\Modules\Auth\Repositories\Eloquent\UserRepository;
use App\Modules\Auth\Services\AuthService;
use App\Modules\Auth\Services\EmailVerificationService;
use App\Modules\Auth\Services\PasswordResetService;
use App\Modules\Auth\Services\PersonalAccessTokenService;
use App\Modules\Auth\Services\RegisterUserService;
use App\Modules\Auth\Services\RoleService;
use App\Modules\Auth\Services\UserRoleResolver;
use Illuminate\Support\ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            dirname(__DIR__, 4).'/config/auth_module.php',
            'auth_module'
        );

        $this->app->singleton(UserRepositoryInterface::class, UserRepository::class);
        $this->app->singleton(RoleRepositoryInterface::class, RoleRepository::class);
        $this->app->singleton(RoleServiceInterface::class, RoleService::class);
        $this->app->singleton(UserRoleResolverInterface::class, UserRoleResolver::class);
        $this->app->singleton(RegisterUserServiceInterface::class, RegisterUserService::class);
        $this->app->singleton(PasswordResetServiceInterface::class, PasswordResetService::class);
        $this->app->singleton(EmailVerificationServiceInterface::class, EmailVerificationService::class);
        $this->app->singleton(PersonalAccessTokenServiceInterface::class, PersonalAccessTokenService::class);
        $this->app->singleton(AuthServiceInterface::class, AuthService::class);
    }

    public function boot(): void
    {
        //
    }
}
