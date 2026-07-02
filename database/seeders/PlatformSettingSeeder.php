<?php

namespace Database\Seeders;

use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use Illuminate\Database\Seeder;

class PlatformSettingSeeder extends Seeder
{
    public function run(PlatformSettingServiceInterface $settings): void
    {
        $settings->seedDefaults();
    }
}
