<?php

namespace Tests\Feature\Event;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Models\EventCategory;
use App\Modules\Event\Models\Venue;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicDiscoveryTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\EventCategorySeeder::class);
    }

    private function createPublishedEvent(
        string $city,
        int $categoryId,
        array $overrides = [],
    ): Event {
        $user = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Discovery Org',
            'slug' => 'discovery-org-'.Str::lower(Str::random(6)),
            'email' => 'discovery@example.com',
            'status' => 'active',
        ]);

        $venue = Venue::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'name' => 'Venue '.$city,
            'type' => 'physical',
            'city' => $city,
            'country_code' => 'ID',
        ]);

        return Event::withoutOrganizerScope()->create(array_merge([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'venue_id' => $venue->id,
            'category_id' => $categoryId,
            'created_by' => $user->id,
            'title' => 'Event '.$city,
            'slug' => 'event-'.Str::lower(Str::random(8)),
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => true,
            'published_at' => now(),
        ], $overrides));
    }

    private function createTicketType(Event $event, float $price, int $quantity = 100, int $sold = 0): void
    {
        TicketType::withoutOrganizerScope()->create([
            'event_id' => $event->id,
            'organizer_id' => $event->organizer_id,
            'name' => 'Standard',
            'kind' => $price > 0 ? 'paid' : 'free',
            'price' => $price,
            'currency' => 'IDR',
            'quantity' => $quantity,
            'sold_count' => $sold,
            'reserved_count' => 0,
            'visibility' => 'public',
            'status' => 'active',
        ]);
    }

    public function test_public_categories_include_event_counts(): void
    {
        $category = EventCategory::query()->where('slug', 'konser')->first();
        $this->assertNotNull($category);

        $this->createPublishedEvent('Jakarta', $category->id);

        $response = $this->getJson('/api/v1/public/event-categories');

        $response->assertOk();
        $response->assertJsonFragment([
            'slug' => 'konser',
            'events_count' => 1,
        ]);
    }

    public function test_public_cities_list_includes_counts(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $this->createPublishedEvent('Bandung', $category->id);
        $this->createPublishedEvent('Bandung', $category->id);

        $response = $this->getJson('/api/v1/public/cities');

        $response->assertOk()
            ->assertJsonFragment(['city' => 'Bandung', 'events_count' => 2]);
    }

    public function test_public_events_can_filter_by_city_and_category(): void
    {
        $konser = EventCategory::query()->where('slug', 'konser')->first();
        $festival = EventCategory::query()->where('slug', 'festival')->first();
        $this->assertNotNull($konser);
        $this->assertNotNull($festival);

        $this->createPublishedEvent('Jakarta', $konser->id);
        $this->createPublishedEvent('Jakarta', $festival->id);
        $this->createPublishedEvent('Surabaya', $konser->id);

        $response = $this->getJson('/api/v1/public/events?city=Jakarta&category_id='.$konser->id);

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_public_events_can_filter_by_is_free(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $this->createPublishedEvent('Jakarta', $category->id, ['is_free' => true]);
        $this->createPublishedEvent('Jakarta', $category->id, [
            'is_free' => false,
            'title' => 'Paid Event',
        ]);

        $response = $this->getJson('/api/v1/public/events?is_free=1');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.is_free', true);
    }

    public function test_public_events_can_filter_by_upcoming_days(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $this->createPublishedEvent('Jakarta', $category->id, [
            'start_at' => now()->addDays(3),
            'end_at' => now()->addDays(4),
        ]);
        $this->createPublishedEvent('Jakarta', $category->id, [
            'title' => 'Far Future',
            'start_at' => now()->addDays(30),
            'end_at' => now()->addDays(31),
        ]);

        $response = $this->getJson('/api/v1/public/events?upcoming_days=7');

        $response->assertOk()
            ->assertJsonCount(1, 'data');
    }

    public function test_public_events_include_min_ticket_price_and_remaining(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $event = $this->createPublishedEvent('Jakarta', $category->id, ['is_free' => false]);
        $this->createTicketType($event, 150000, quantity: 50, sold: 45);

        $response = $this->getJson('/api/v1/public/events');

        $response->assertOk()
            ->assertJsonPath('data.0.min_ticket_price', 150000)
            ->assertJsonPath('data.0.tickets_remaining', 5);
    }

    public function test_public_events_can_sort_by_title(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $this->createPublishedEvent('Jakarta', $category->id, [
            'title' => 'Zulu Event',
            'slug' => 'zulu-event-'.Str::lower(Str::random(6)),
        ]);
        $this->createPublishedEvent('Jakarta', $category->id, [
            'title' => 'Alpha Event',
            'slug' => 'alpha-event-'.Str::lower(Str::random(6)),
        ]);

        $response = $this->getJson('/api/v1/public/events?sort=title');

        $response->assertOk()
            ->assertJsonPath('data.0.title', 'Alpha Event')
            ->assertJsonPath('data.1.title', 'Zulu Event');
    }

    public function test_public_stats_returns_platform_counts(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $this->createPublishedEvent('Jakarta', $category->id);

        $response = $this->getJson('/api/v1/public/stats');

        $response->assertOk()
            ->assertJsonPath('data.published_events_count', 1)
            ->assertJsonPath('data.organizer_count', 1);
    }

    public function test_public_featured_organizers_lists_organizers_with_logos(): void
    {
        $category = EventCategory::query()->first();
        $this->assertNotNull($category);

        $event = $this->createPublishedEvent('Jakarta', $category->id);
        $event->organizer->update(['logo_url' => 'https://example.com/logo.png']);

        $response = $this->getJson('/api/v1/public/featured-organizers');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.logo_url', 'https://example.com/logo.png');
    }
}
