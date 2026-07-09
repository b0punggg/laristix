<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\EventCategory;
use App\Modules\Event\Models\EventTag;
use App\Modules\Event\Models\Venue;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class EventPhaseCTest extends TestCase
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
            'name' => 'Phase C Organizer',
            'slug' => 'phase-c-org-'.Str::lower(Str::random(8)),
            'email' => 'phase-c-'.Str::random(6).'@example.com',
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

    public function test_owner_can_create_event_with_multiple_categories_and_tags(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $venue = Venue::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'name' => 'Venue A',
            'type' => 'physical',
            'city' => 'Jakarta',
        ]);

        $categoryA = EventCategory::query()->create([
            'organizer_id' => null,
            'name' => 'Music',
            'slug' => 'music-'.Str::lower(Str::random(6)),
            'is_active' => true,
        ]);

        $categoryB = EventCategory::query()->create([
            'organizer_id' => null,
            'name' => 'Festival',
            'slug' => 'festival-'.Str::lower(Str::random(6)),
            'is_active' => true,
        ]);

        $tag = EventTag::query()->create([
            'organizer_id' => $organizer->id,
            'name' => 'Live',
            'slug' => 'live-'.Str::lower(Str::random(6)),
        ]);

        $response = $this->postJson('/api/v1/events', [
            'title' => 'Multi Taxonomy Event',
            'venue_id' => $venue->id,
            'category_ids' => [$categoryA->id, $categoryB->id],
            'tag_ids' => [$tag->id],
            'start_at' => now()->addDays(3)->toIso8601String(),
            'end_at' => now()->addDays(4)->toIso8601String(),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'visibility' => 'public',
        ]);

        $response->assertCreated();
        $response->assertJsonPath('data.category.id', $categoryA->id);
        $response->assertJsonCount(2, 'data.categories');
        $response->assertJsonCount(1, 'data.tags');
    }

    public function test_owner_can_sync_registration_fields(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $venue = Venue::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'name' => 'Venue B',
            'type' => 'physical',
            'city' => 'Bandung',
        ]);

        $category = EventCategory::query()->create([
            'organizer_id' => null,
            'name' => 'Workshop',
            'slug' => 'workshop-'.Str::lower(Str::random(6)),
            'is_active' => true,
        ]);

        $create = $this->postJson('/api/v1/events', [
            'title' => 'Registration Form Event',
            'venue_id' => $venue->id,
            'category_id' => $category->id,
            'start_at' => now()->addDays(5)->toIso8601String(),
            'end_at' => now()->addDays(6)->toIso8601String(),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'visibility' => 'public',
        ]);

        $uuid = $create->json('data.uuid');

        $response = $this->putJson("/api/v1/events/{$uuid}/registration-form/fields", [
            'fields' => [
                [
                    'label' => 'Ukuran kaos',
                    'name' => 'shirt_size',
                    'type' => 'select',
                    'is_required' => true,
                    'options' => [
                        ['label' => 'M', 'value' => 'M'],
                        ['label' => 'L', 'value' => 'L'],
                    ],
                ],
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.fields.0.label', 'Ukuran kaos');
        $response->assertJsonCount(2, 'data.fields.0.options');
    }

    public function test_owner_can_submit_compliance_profile(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/organizers/current/compliance', [
            'type' => 'individual',
            'legal_name' => 'Budi Santoso',
            'ktp_number' => '3174012345670001',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'pending');
        $response->assertJsonPath('data.legal_name', 'Budi Santoso');
    }

    public function test_owner_can_save_microsite_settings(): void
    {
        [$user, $organizer] = $this->createOrganizerOwner();
        Sanctum::actingAs($user);

        $venue = Venue::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'name' => 'Venue C',
            'type' => 'physical',
            'city' => 'Surabaya',
        ]);

        $category = EventCategory::query()->create([
            'organizer_id' => null,
            'name' => 'Seminar',
            'slug' => 'seminar-'.Str::lower(Str::random(6)),
            'is_active' => true,
        ]);

        $create = $this->postJson('/api/v1/events', [
            'title' => 'Microsite Event',
            'venue_id' => $venue->id,
            'category_id' => $category->id,
            'start_at' => now()->addDays(8)->toIso8601String(),
            'end_at' => now()->addDays(9)->toIso8601String(),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'visibility' => 'public',
        ]);

        $uuid = $create->json('data.uuid');

        $response = $this->patchJson("/api/v1/events/{$uuid}", [
            'settings' => [
                'gallery' => [
                    ['url' => 'https://cdn.example.com/photo-1.jpg', 'alt' => 'Sesi utama'],
                    ['url' => 'https://cdn.example.com/photo-2.jpg'],
                ],
                'faq' => [
                    ['question' => 'Bawa KTP?', 'answer' => 'Ya, wajib.'],
                ],
                'speakers' => [
                    ['name' => 'Dr. Andi', 'title' => 'Keynote Speaker'],
                ],
                'schedule' => [
                    ['title' => 'Registrasi', 'start_at' => '08:00'],
                ],
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.settings.gallery.0.alt', 'Sesi utama');
        $response->assertJsonPath('data.settings.faq.0.question', 'Bawa KTP?');
        $response->assertJsonPath('data.settings.speakers.0.name', 'Dr. Andi');
        $response->assertJsonPath('data.settings.schedule.0.title', 'Registrasi');
    }
}
