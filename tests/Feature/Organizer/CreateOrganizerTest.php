<?php

namespace Tests\Feature\Organizer;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CreateOrganizerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_cannot_create_organizer(): void
    {
        $response = $this->postJson('/api/v1/organizers', [
            'name' => 'New Organizer',
            'email' => 'org@example.com',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response->assertUnauthorized();
    }

    public function test_authenticated_user_can_create_organizer(): void
    {
        $user = User::factory()->create([
            'email_verified_at' => now(),
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/organizers', [
            'name' => 'New Organizer',
            'email' => 'org@example.com',
            'timezone' => 'Asia/Jakarta',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.name', 'New Organizer');

        $this->assertDatabaseHas('organizers', [
            'name' => 'New Organizer',
            'email' => 'org@example.com',
        ]);

        $organizer = Organizer::query()->where('email', 'org@example.com')->firstOrFail();

        $this->assertDatabaseHas('organizer_members', [
            'organizer_id' => $organizer->id,
            'user_id' => $user->id,
            'role' => 'owner',
            'status' => 'active',
        ]);
    }
}
