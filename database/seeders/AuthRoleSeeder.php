<?php

namespace Database\Seeders;

use App\Modules\Auth\Contracts\RoleServiceInterface;
use Illuminate\Database\Seeder;

class AuthRoleSeeder extends Seeder
{
    public function run(RoleServiceInterface $roleService): void
    {
        $roleService->seedApplicationRoles();
    }
}
