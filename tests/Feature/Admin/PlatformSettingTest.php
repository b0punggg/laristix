<?php

namespace Tests\Feature\Admin;

use App\Modules\Auth\Models\User;
use App\Modules\Admin\Models\PlatformSetting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PlatformSettingTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_platform_settings(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/settings');

        $response->assertOk();
        $response->assertJsonFragment(['key' => 'maintenance_mode']);
        $response->assertJsonFragment(['key' => 'default_platform_fee']);
    }

    public function test_super_admin_can_update_maintenance_mode(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        Sanctum::actingAs($admin);

        $response = $this->patchJson('/api/v1/admin/settings/maintenance_mode', [
            'value' => [
                'enabled' => true,
                'message' => 'Scheduled maintenance in progress.',
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.value.enabled', true);

        $this->assertDatabaseHas('platform_settings', [
            'key' => 'maintenance_mode',
        ]);
    }

    public function test_maintenance_mode_blocks_public_checkout(): void
    {
        PlatformSetting::query()->create([
            'key' => 'maintenance_mode',
            'value' => [
                'enabled' => true,
                'message' => 'Down for maintenance.',
            ],
        ]);

        $response = $this->postJson('/api/v1/public/events/00000000-0000-0000-0000-000000000000/checkout', []);

        $response->assertStatus(503);
        $response->assertJsonPath('error_code', 'PLATFORM_MAINTENANCE');
    }

    public function test_non_admin_cannot_update_platform_settings(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/v1/admin/settings/maintenance_mode', [
            'value' => [
                'enabled' => false,
                'message' => 'OK',
            ],
        ]);

        $response->assertForbidden();
    }
}
