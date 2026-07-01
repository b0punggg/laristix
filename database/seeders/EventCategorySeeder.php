<?php

namespace Database\Seeders;

use App\Modules\Event\Models\EventCategory;
use Illuminate\Database\Seeder;

class EventCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Konferensi', 'slug' => 'konferensi', 'icon' => 'presentation', 'sort_order' => 1],
            ['name' => 'Workshop', 'slug' => 'workshop', 'icon' => 'wrench', 'sort_order' => 2],
            ['name' => 'Seminar', 'slug' => 'seminar', 'icon' => 'users', 'sort_order' => 3],
            ['name' => 'Konser', 'slug' => 'konser', 'icon' => 'music', 'sort_order' => 4],
            ['name' => 'Festival', 'slug' => 'festival', 'icon' => 'sparkles', 'sort_order' => 5],
            ['name' => 'Olahraga', 'slug' => 'olahraga', 'icon' => 'trophy', 'sort_order' => 6],
            ['name' => 'Komunitas', 'slug' => 'komunitas', 'icon' => 'heart', 'sort_order' => 7],
            ['name' => 'Online', 'slug' => 'online', 'icon' => 'monitor', 'sort_order' => 8],
        ];

        foreach ($categories as $category) {
            EventCategory::query()->updateOrCreate(
                ['organizer_id' => null, 'slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'icon' => $category['icon'],
                    'sort_order' => $category['sort_order'],
                    'is_active' => true,
                ],
            );
        }
    }
}
