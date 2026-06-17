<?php

namespace App\Modules\Auth\Repositories\Contracts;

use App\Modules\Auth\Models\User;

interface UserRepositoryInterface
{
    public function findByEmail(string $email): ?User;

    public function findById(int $id): ?User;

    public function findByUuid(string $uuid): ?User;

    public function create(array $attributes): User;

    public function update(User $user, array $attributes): User;

    public function emailExists(string $email): bool;
}
