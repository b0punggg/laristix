<?php

namespace App\Modules\Admin\Repositories\Contracts;

use App\Modules\Admin\Models\PlatformSetting;
use Illuminate\Support\Collection;

interface PlatformSettingRepositoryInterface
{
    public function findByKey(string $key): ?PlatformSetting;

    /**
     * @return Collection<int, PlatformSetting>
     */
    public function all(): Collection;

    public function upsert(string $key, array $value, ?int $updatedBy = null, ?string $description = null): PlatformSetting;
}
