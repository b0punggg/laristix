<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use App\Modules\Admin\Models\PlatformSetting;
use App\Modules\Admin\Repositories\Contracts\PlatformSettingRepositoryInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use Illuminate\Support\Collection;

class PlatformSettingService implements PlatformSettingServiceInterface
{
    public function __construct(
        private readonly PlatformSettingRepositoryInterface $settings,
        private readonly AuditLogServiceInterface $auditLogs,
    ) {}

    public function seedDefaults(): void
    {
        foreach (config('admin_module.default_settings', []) as $key => $value) {
            if ($this->settings->findByKey($key) === null) {
                $this->settings->upsert($key, $value, null, $this->descriptionForKey($key));
            }
        }
    }

    public function listAll(User $admin): Collection
    {
        $this->assertSuperAdmin($admin);
        $this->seedDefaults();

        return $this->settings->all();
    }

    public function update(User $admin, string $key, array $value): PlatformSetting
    {
        $this->assertSuperAdmin($admin);
        $this->seedDefaults();

        $existing = $this->settings->findByKey($key);
        $oldValue = $existing?->value;

        $updated = $this->settings->upsert(
            $key,
            $value,
            $admin->id,
            $this->descriptionForKey($key)
        );

        $this->auditLogs->record(
            category: 'admin',
            event: 'platform_setting.updated',
            user: $admin,
            auditable: $updated,
            oldValues: $oldValue !== null ? ['value' => $oldValue] : null,
            newValues: ['value' => $value],
            metadata: ['key' => $key],
        );

        return $updated;
    }

    public function getValue(string $key, ?array $default = null): ?array
    {
        $setting = $this->settings->findByKey($key);

        if ($setting === null) {
            $configured = config("admin_module.default_settings.{$key}");

            return $configured ?? $default;
        }

        return $setting->value;
    }

    public function isMaintenanceModeEnabled(): bool
    {
        $value = $this->getValue('maintenance_mode', ['enabled' => false]);

        return (bool) ($value['enabled'] ?? false);
    }

    private function descriptionForKey(string $key): string
    {
        return match ($key) {
            'maintenance_mode' => 'Platform-wide maintenance mode toggle and message.',
            'default_platform_fee' => 'Default platform fee applied when an organizer has no active fee config.',
            default => 'Platform setting.',
        };
    }

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
