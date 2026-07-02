<?php

namespace Tests\Feature\Admin;

use App\Modules\Admin\Models\AuditLog;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_audit_logs(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        AuditLog::query()->create([
            'user_id' => $admin->id,
            'category' => 'admin',
            'event' => 'organizer.approved',
            'auditable_type' => Organizer::class,
            'auditable_id' => 1,
            'new_values' => ['status' => OrganizerStatus::ACTIVE],
            'created_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/audit-logs');

        $response->assertOk();
        $response->assertJsonPath('data.0.event', 'organizer.approved');
    }

    public function test_super_admin_can_filter_audit_logs_by_category(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        AuditLog::query()->create([
            'category' => 'admin',
            'event' => 'organizer.approved',
            'created_at' => now(),
        ]);

        AuditLog::query()->create([
            'category' => 'system',
            'event' => 'system.boot',
            'created_at' => now(),
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/audit-logs?category=admin');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
    }

    public function test_approve_organizer_creates_audit_log(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Audit Org',
            'slug' => 'audit-org-'.Str::lower(Str::random(6)),
            'email' => 'audit@example.com',
            'status' => OrganizerStatus::PENDING,
        ]);

        Sanctum::actingAs($admin);

        $this->postJson('/api/v1/admin/organizers/'.$organizer->uuid.'/approve')->assertOk();

        $this->assertDatabaseHas('audit_logs', [
            'event' => 'organizer.approved',
            'category' => 'admin',
            'user_id' => $admin->id,
        ]);

        $this->assertDatabaseHas('activity_logs', [
            'action' => 'organizer.approved',
            'subject_type' => Organizer::class,
            'subject_id' => $organizer->id,
        ]);
    }
}
