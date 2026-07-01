<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\EventCategory;
use App\Modules\Event\Models\Venue;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventManagementTest extends TestCase
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
            'name' => 'Test Organizer',
            'slug' => 'test-organizer-'.Str::lower(Str::random(8)),
            'email' => 'org-'.Str::random(6).'@example.com',
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

    /**
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function eventPayload(Organizer $organizer, array $overrides = []): array
    {
        $venue = Venue::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'name' => 'Test Venue',
            'type' => 'physical',
            'city' => 'Jakarta',
        ]);

        $category = EventCategory::query()->create([
            'organizer_id' => null,
            'name' => 'Conference',
            'slug' => 'conference-'.Str::lower(Str::random(8)),
            'is_active' => true,
        ]);

        return array_merge([
            'title' => 'Tech Conference 2026',
            'venue_id' => $venue->id,
            'category_id' => $category->id,
            'start_at' => now()->addDays(7)->toIso8601String(),
            'end_at' => now()->addDays(8)->toIso8601String(),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'visibility' => 'public',
        ], $overrides);
    }

    public function test_owner_can_create_event_as_draft(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/events', $this->eventPayload($organizer));

        $response->assertCreated();
        $response->assertJsonPath('data.status', EventStatus::DRAFT);
        $response->assertJsonPath('data.title', 'Tech Conference 2026');
        $response->assertJsonPath('data.management.can_publish', true);
        $response->assertJsonPath('data.management.can_edit', true);
    }

    public function test_owner_can_edit_draft_event(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/events', $this->eventPayload($organizer));
        $uuid = $create->json('data.uuid');

        $response = $this->patchJson("/api/v1/events/{$uuid}", [
            'title' => 'Updated Conference Title',
            'short_description' => 'A short summary.',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.title', 'Updated Conference Title');
        $response->assertJsonPath('data.short_description', 'A short summary.');
    }

    public function test_owner_can_publish_draft_event(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/events', $this->eventPayload($organizer));
        $uuid = $create->json('data.uuid');

        $response = $this->postJson("/api/v1/events/{$uuid}/publish");

        $response->assertOk();
        $response->assertJsonPath('data.status', EventStatus::PUBLISHED);
        $response->assertJsonPath('data.management.can_draft', true);
        $this->assertNotNull($response->json('data.published_at'));
    }

    public function test_owner_can_revert_published_event_to_draft(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/events', $this->eventPayload($organizer));
        $uuid = $create->json('data.uuid');

        $this->postJson("/api/v1/events/{$uuid}/publish")->assertOk();

        $response = $this->postJson("/api/v1/events/{$uuid}/draft");

        $response->assertOk();
        $response->assertJsonPath('data.status', EventStatus::DRAFT);
        $response->assertJsonPath('data.published_at', null);
        $response->assertJsonPath('data.management.can_publish', true);
    }

    public function test_owner_can_delete_draft_event(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $create = $this->postJson('/api/v1/events', $this->eventPayload($organizer));
        $uuid = $create->json('data.uuid');

        $response = $this->deleteJson("/api/v1/events/{$uuid}");

        $response->assertOk();
        $this->assertSoftDeleted('events', ['uuid' => $uuid]);
    }

    public function test_staff_cannot_create_event(): void
    {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Staff Organizer',
            'slug' => 'staff-org-'.Str::lower(Str::random(8)),
            'email' => 'staff-org@example.com',
            'status' => 'active',
        ]);

        OrganizerMember::query()->create([
            'organizer_id' => $organizer->id,
            'user_id' => $user->id,
            'role' => 'staff',
            'status' => 'active',
            'accepted_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/events', $this->eventPayload($organizer));

        $response->assertForbidden();
    }

    public function test_owner_can_list_events(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/events', $this->eventPayload($organizer, ['title' => 'Event A']));
        $this->postJson('/api/v1/events', $this->eventPayload($organizer, ['title' => 'Event B']));

        $response = $this->getJson('/api/v1/events?status=draft');

        $response->assertOk();
        $response->assertJsonCount(2, 'data');
    }
}
