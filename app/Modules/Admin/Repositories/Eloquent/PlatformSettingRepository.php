<?php

namespace App\Modules\Admin\Repositories\Eloquent;

use App\Modules\Admin\Models\PlatformSetting;
use App\Modules\Admin\Repositories\Contracts\PlatformSettingRepositoryInterface;
use Illuminate\Support\Collection;

class PlatformSettingRepository implements PlatformSettingRepositoryInterface
{
    public function findByKey(string $key): ?PlatformSetting
    {
        return PlatformSetting::query()->where('key', $key)->first();
    }

    public function all(): Collection
    {
        return PlatformSetting::query()->orderBy('key')->get();
    }

    public function upsert(string $key, array $value, ?int $updatedBy = null, ?string $description = null): PlatformSetting
    {
        $setting = $this->findByKey($key);

        if ($setting === null) {
            return PlatformSetting::query()->create([
                'key' => $key,
                'value' => $value,
                'description' => $description,
                'updated_by' => $updatedBy,
            ]);
        }

        $attributes = [
            'value' => $value,
            'updated_by' => $updatedBy,
        ];

        if ($description !== null) {
            $attributes['description'] = $description;
        }

        $setting->fill($attributes);
        $setting->save();

        return $setting->fresh();
    }
}
