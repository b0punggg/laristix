<?php

namespace Tests\Unit\Modules\Event;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Enums\EventVisibility;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class EventEnumsTest extends TestCase
{
    #[Test]
    public function it_exposes_event_status_constants(): void
    {
        $this->assertContains('draft', EventStatus::values());
        $this->assertContains('published', EventStatus::publicVisible());
    }

    #[Test]
    public function it_exposes_visibility_constants(): void
    {
        $this->assertSame('public', EventVisibility::PUBLIC);
        $this->assertCount(3, EventVisibility::values());
    }
}
