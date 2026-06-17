<?php

namespace App\Modules\Auth\Repositories\Eloquent;

use App\Modules\Auth\Models\User;
use App\Modules\Auth\Repositories\Contracts\UserRepositoryInterface;

class UserRepository implements UserRepositoryInterface
{
    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }

    public function findById(int $id): ?User
    {
        return User::query()->find($id);
    }

    public function findByUuid(string $uuid): ?User
    {
        return User::query()->where('uuid', $uuid)->first();
    }

    public function create(array $attributes): User
    {
        return User::query()->create($attributes);
    }

    public function update(User $user, array $attributes): User
    {
        $user->fill($attributes);
        $user->save();

        return $user->fresh();
    }

    public function emailExists(string $email): bool
    {
        return User::query()->where('email', $email)->exists();
    }
}
