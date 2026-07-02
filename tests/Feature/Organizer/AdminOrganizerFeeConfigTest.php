<?php

namespace Tests\Feature\Organizer;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerFeeConfig;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrganizerFeeConfigTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_organizer_fee_configs(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        $organizer = $this->createOrganizer();

        OrganizerFeeConfig::query()->create([
            'organizer_id' => $organizer->id,
            'fee_type' => 'percentage',
            'percentage_rate' => 5,
            'flat_amount' => 0,
            'fee_bearer' => 'attendee',
            'effective_from' => now()->subDay(),
            'created_by' => $admin->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/organizers/'.$organizer->uuid.'/fee-configs');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.percentage_rate', 5);
    }

    public function test_super_admin_can_create_fee_config(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        $organizer = $this->createOrganizer();

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/organizers/'.$organizer->uuid.'/fee-configs', [
            'fee_type' => 'both',
            'percentage_rate' => 3.5,
            'flat_amount' => 5000,
            'fee_bearer' => 'attendee',
            'effective_from' => now()->addDay()->toIso8601String(),
            'notes' => 'Promotional rate',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.percentage_rate', 3.5);

        $this->assertDatabaseHas('organizer_fee_configs', [
            'organizer_id' => $organizer->id,
            'percentage_rate' => 3.5,
            'flat_amount' => 5000,
        ]);
    }

    public function test_super_admin_can_delete_future_fee_config(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        $organizer = $this->createOrganizer();

        $config = OrganizerFeeConfig::query()->create([
            'organizer_id' => $organizer->id,
            'fee_type' => 'percentage',
            'percentage_rate' => 10,
            'flat_amount' => 0,
            'fee_bearer' => 'attendee',
            'effective_from' => now()->addWeek(),
            'created_by' => $admin->id,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->deleteJson(
            '/api/v1/admin/organizers/'.$organizer->uuid.'/fee-configs/'.$config->id
        );

        $response->assertOk();
        $this->assertDatabaseMissing('organizer_fee_configs', ['id' => $config->id]);
    }

    public function test_non_admin_cannot_manage_fee_configs(): void
    {
        $user = User::factory()->create();
        $organizer = $this->createOrganizer();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/organizers/'.$organizer->uuid.'/fee-configs');

        $response->assertForbidden();
    }

    private function createOrganizer(): Organizer
    {
        return Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Fee Org',
            'slug' => 'fee-org-'.Str::lower(Str::random(6)),
            'email' => 'fee@example.com',
            'status' => OrganizerStatus::ACTIVE,
        ]);
    }
}
