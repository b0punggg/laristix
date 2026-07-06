<?php

namespace Tests\Feature\Organizer;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use App\Modules\Organizer\Notifications\OrganizerMemberInvitationNotification;
use Tests\TestCase;

class OrganizerMemberTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array{0: User, 1: Organizer}
     */
    private function createOrganizerOwner(): array
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Member Org',
            'slug' => 'member-org-'.Str::lower(Str::random(6)),
            'email' => 'member-org@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        return [$user, $organizer];
    }

    public function test_owner_can_invite_existing_user_as_staff(): void
    {
        Notification::fake();

        [$owner, $organizer] = $this->createOrganizerOwner();
        $staff = User::factory()->create(['email' => 'staff-user@example.com']);

        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/v1/organizers/current/members', [
            'email' => $staff->email,
            'role' => 'staff',
        ], [
            'X-Organizer-Id' => (string) $organizer->id,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.role', 'staff')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('organizer_members', [
            'organizer_id' => $organizer->id,
            'user_id' => $staff->id,
            'role' => 'staff',
            'status' => 'pending',
        ]);

        Notification::assertSentTo($staff, OrganizerMemberInvitationNotification::class);
    }

    public function test_invite_fails_when_user_not_registered(): void
    {
        [$owner, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($owner);

        $response = $this->postJson('/api/v1/organizers/current/members', [
            'email' => 'unknown@example.com',
            'role' => 'staff',
        ], [
            'X-Organizer-Id' => (string) $organizer->id,
        ]);

        $response->assertForbidden();
    }

    public function test_staff_can_accept_pending_invitation(): void
    {
        [$owner, $organizer] = $this->createOrganizerOwner();
        $staff = User::factory()->create();

        $membership = OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $staff->id,
            'role' => 'staff',
            'status' => 'pending',
            'invited_by' => $owner->id,
            'invited_at' => now(),
        ]);

        Sanctum::actingAs($staff);

        $response = $this->postJson('/api/v1/auth/organizer-invitations/'.$membership->id.'/accept');

        $response->assertOk()
            ->assertJsonPath('data.primary_role', 'staff')
            ->assertJsonPath('data.active_organizer.id', $organizer->id);

        $this->assertDatabaseHas('organizer_members', [
            'id' => $membership->id,
            'status' => 'active',
        ]);
    }

    public function test_user_can_list_pending_invitations(): void
    {
        [$owner, $organizer] = $this->createOrganizerOwner();
        $staff = User::factory()->create();

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $staff->id,
            'role' => 'staff',
            'status' => 'pending',
            'invited_by' => $owner->id,
            'invited_at' => now(),
        ]);

        Sanctum::actingAs($staff);

        $response = $this->getJson('/api/v1/auth/organizer-invitations');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.organizer.id', $organizer->id)
            ->assertJsonPath('data.0.role', 'staff');
    }

    public function test_staff_cannot_invite_members(): void
    {
        [$owner, $organizer] = $this->createOrganizerOwner();
        $staff = User::factory()->create();
        $target = User::factory()->create(['email' => 'target@example.com']);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $staff->id,
            'role' => 'staff',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        Sanctum::actingAs($staff);

        $response = $this->postJson('/api/v1/organizers/current/members', [
            'email' => $target->email,
            'role' => 'staff',
        ], [
            'X-Organizer-Id' => (string) $organizer->id,
        ]);

        $response->assertForbidden();
    }
}
