<?php

namespace Tests\Feature\Organizer;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminOrganizerTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_pending_organizers(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $pending = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Pending Org',
            'slug' => 'pending-org-'.Str::lower(Str::random(6)),
            'email' => 'pending@example.com',
            'status' => OrganizerStatus::PENDING,
        ]);

        Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Active Org',
            'slug' => 'active-org-'.Str::lower(Str::random(6)),
            'email' => 'active@example.com',
            'status' => OrganizerStatus::ACTIVE,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/organizers/pending');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.uuid', $pending->uuid);
        $response->assertJsonPath('data.0.name', 'Pending Org');
        $response->assertJsonPath('data.0.status', OrganizerStatus::PENDING);
    }

    public function test_non_admin_cannot_list_pending_organizers(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/organizers/pending');

        $response->assertForbidden();
    }

    public function test_super_admin_can_approve_pending_organizer(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Awaiting Approval',
            'slug' => 'awaiting-'.Str::lower(Str::random(6)),
            'email' => 'awaiting@example.com',
            'status' => OrganizerStatus::PENDING,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/organizers/'.$organizer->uuid.'/approve');

        $response->assertOk();
        $response->assertJsonPath('data.status', OrganizerStatus::ACTIVE);
        $response->assertJsonPath('message', 'Organizer approved successfully.');

        $this->assertDatabaseHas('organizers', [
            'id' => $organizer->id,
            'status' => OrganizerStatus::ACTIVE,
            'approved_by' => $admin->id,
        ]);

        $organizer->refresh();
        $this->assertNotNull($organizer->approved_at);
    }

    public function test_non_admin_cannot_approve_organizer(): void
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Pending Only',
            'slug' => 'pending-only-'.Str::lower(Str::random(6)),
            'email' => 'pending-only@example.com',
            'status' => OrganizerStatus::PENDING,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/admin/organizers/'.$organizer->uuid.'/approve');

        $response->assertForbidden();

        $this->assertDatabaseHas('organizers', [
            'id' => $organizer->id,
            'status' => OrganizerStatus::PENDING,
        ]);
    }

    public function test_cannot_approve_already_active_organizer(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Already Active',
            'slug' => 'already-active-'.Str::lower(Str::random(6)),
            'email' => 'active@example.com',
            'status' => OrganizerStatus::ACTIVE,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/organizers/'.$organizer->uuid.'/approve');

        $response->assertForbidden();
    }

    public function test_super_admin_can_list_all_organizers_with_filters(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Alpha Org',
            'slug' => 'alpha-org-'.Str::lower(Str::random(6)),
            'email' => 'alpha@example.com',
            'status' => OrganizerStatus::ACTIVE,
        ]);

        Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Beta Pending',
            'slug' => 'beta-pending-'.Str::lower(Str::random(6)),
            'email' => 'beta@example.com',
            'status' => OrganizerStatus::PENDING,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/organizers?status=pending');

        $response->assertOk();
        $response->assertJsonCount(1, 'data');
        $response->assertJsonPath('data.0.name', 'Beta Pending');
        $response->assertJsonPath('meta.total', 1);
    }

    public function test_super_admin_can_view_organizer_detail(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);
        $owner = User::factory()->create([
            'name' => 'Org Owner',
            'email' => 'owner@example.com',
        ]);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Detail Org',
            'slug' => 'detail-org-'.Str::lower(Str::random(6)),
            'email' => 'detail@example.com',
            'status' => OrganizerStatus::ACTIVE,
            'approved_at' => now(),
            'approved_by' => $admin->id,
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $owner->id,
            'role' => OrganizerMemberRole::OWNER,
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $owner->id,
            'title' => 'Detail Event',
            'slug' => 'detail-event',
            'status' => EventStatus::DRAFT,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/organizers/'.$organizer->uuid);

        $response->assertOk();
        $response->assertJsonPath('data.name', 'Detail Org');
        $response->assertJsonPath('data.events_count', 1);
        $response->assertJsonPath('data.owner.name', 'Org Owner');
        $response->assertJsonPath('data.approved_by.name', $admin->name);
    }

    public function test_super_admin_can_suspend_active_organizer(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Suspend Me',
            'slug' => 'suspend-me-'.Str::lower(Str::random(6)),
            'email' => 'suspend@example.com',
            'status' => OrganizerStatus::ACTIVE,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->patchJson('/api/v1/admin/organizers/'.$organizer->uuid.'/suspend');

        $response->assertOk();
        $response->assertJsonPath('data.status', OrganizerStatus::SUSPENDED);

        $this->assertDatabaseHas('organizers', [
            'id' => $organizer->id,
            'status' => OrganizerStatus::SUSPENDED,
        ]);
    }

    public function test_super_admin_can_activate_suspended_organizer(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Reactivate Me',
            'slug' => 'reactivate-me-'.Str::lower(Str::random(6)),
            'email' => 'reactivate@example.com',
            'status' => OrganizerStatus::SUSPENDED,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->patchJson('/api/v1/admin/organizers/'.$organizer->uuid.'/activate');

        $response->assertOk();
        $response->assertJsonPath('data.status', OrganizerStatus::ACTIVE);
    }

    public function test_super_admin_can_reject_pending_organizer(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Reject Me',
            'slug' => 'reject-me-'.Str::lower(Str::random(6)),
            'email' => 'reject@example.com',
            'status' => OrganizerStatus::PENDING,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->postJson('/api/v1/admin/organizers/'.$organizer->uuid.'/reject');

        $response->assertOk();
        $response->assertJsonPath('data.status', OrganizerStatus::ARCHIVED);
    }

    public function test_non_admin_cannot_list_all_organizers(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/organizers');

        $response->assertForbidden();
    }
}
