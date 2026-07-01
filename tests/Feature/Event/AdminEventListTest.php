<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminEventListTest extends TestCase
{
    use RefreshDatabase;

    public function test_super_admin_can_list_all_platform_events(): void
    {
        $admin = User::factory()->create(['platform_role' => 'super_admin']);

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Org A',
            'slug' => 'org-a-'.Str::lower(Str::random(6)),
            'email' => 'org-a@example.com',
            'status' => 'active',
        ]);

        $owner = User::factory()->create();

        Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $owner->id,
            'title' => 'Platform Event Alpha',
            'slug' => 'platform-event-alpha',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDays(5),
            'end_at' => now()->addDays(6),
            'timezone' => 'Asia/Jakarta',
            'published_at' => now(),
            'is_free' => false,
        ]);

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/v1/admin/events');

        $response->assertOk();
        $response->assertJsonPath('data.0.title', 'Platform Event Alpha');
        $response->assertJsonPath('data.0.organizer.name', 'Org A');
    }

    public function test_non_admin_cannot_list_platform_events(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/admin/events');

        $response->assertForbidden();
    }
}
