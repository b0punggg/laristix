<?php

namespace Tests\Unit\Modules\Ticketing;

use App\Modules\Event\Models\Event;
use App\Modules\Ticketing\Models\TicketType;
use Carbon\Carbon;
use Tests\TestCase;

class TicketTypeSalesTimezoneTest extends TestCase
{
    public function test_sales_open_uses_event_timezone(): void
    {
        config(['app.timezone' => 'Asia/Jakarta']);

        $event = new Event([
            'timezone' => 'Asia/Jakarta',
        ]);

        $ticketType = new TicketType([
            'name' => 'TZ Ticket',
            'kind' => 'paid',
            'price' => 100000,
            'currency' => 'IDR',
            'quantity' => 100,
            'sold_count' => 0,
            'reserved_count' => 0,
            'visibility' => 'public',
            'status' => 'active',
            'sales_start_at' => Carbon::parse('2026-06-25 16:59:00', 'Asia/Jakarta'),
            'sales_end_at' => Carbon::parse('2026-06-30 16:59:00', 'Asia/Jakarta'),
        ]);
        $ticketType->setRelation('event', $event);

        Carbon::setTestNow(Carbon::parse('2026-06-26 10:00:00', 'Asia/Jakarta'));

        $this->assertTrue($ticketType->isSalesOpen());
        $this->assertTrue($ticketType->isPurchasable());

        Carbon::setTestNow(Carbon::parse('2026-06-25 10:00:00', 'Asia/Jakarta'));

        $this->assertFalse($ticketType->isSalesOpen());
        $this->assertFalse($ticketType->isPurchasable());

        Carbon::setTestNow();
    }
}
