<?php

namespace App\Modules\Admin\Contracts;

use App\Modules\Auth\Models\User;
use Illuminate\Support\Collection;

interface PlatformSettingServiceInterface
{
    public function seedDefaults(): void;

    /**
     * @return Collection<int, \App\Modules\Admin\Models\PlatformSetting>
     */
    public function listAll(User $admin): Collection;

    public function update(User $admin, string $key, array $value): \App\Modules\Admin\Models\PlatformSetting;

    public function getValue(string $key, ?array $default = null): ?array;

    public function isMaintenanceModeEnabled(): bool;
}
