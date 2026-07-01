<?php

namespace Tests\Unit\Modules\Ticketing;

use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Enums\TicketTypeStatus;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TicketKindTest extends TestCase
{
    #[Test]
    public function it_exposes_ticket_kind_constants(): void
    {
        $this->assertSame('free', TicketKind::FREE);
        $this->assertSame('paid', TicketKind::PAID);
        $this->assertSame('vip', TicketKind::VIP);
    }

    #[Test]
    public function it_provides_default_names_per_kind(): void
    {
        $this->assertSame('Free Ticket', TicketKind::defaultName(TicketKind::FREE));
        $this->assertSame('VIP Ticket', TicketKind::defaultName(TicketKind::VIP));
    }

    #[Test]
    public function it_lists_all_kind_values(): void
    {
        $this->assertCount(3, TicketKind::values());
    }

    #[Test]
    public function it_exposes_ticket_type_status_constants(): void
    {
        $this->assertContains('active', TicketTypeStatus::values());
        $this->assertContains('sold_out', TicketTypeStatus::publicVisible());
    }
}
