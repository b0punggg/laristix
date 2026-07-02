<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Contracts\DailyStatsRecorderServiceInterface;
use App\Modules\Admin\Models\DailyEventStat;
use App\Modules\Admin\Models\DailyOrganizerStat;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\Order;
use Carbon\Carbon;

class DailyStatsRecorderService implements DailyStatsRecorderServiceInterface
{
    public function recordOrderCompleted(Order $order): void
    {
        $order->loadMissing(['registrations']);
        $statDate = Carbon::parse($order->completed_at ?? now())->toDateString();
        $registrationCount = $order->registrations->count();

        $this->incrementEventStat($order->event_id, $order->organizer_id, $statDate, [
            'orders_count' => 1,
            'registrations_count' => $registrationCount,
            'revenue_gross' => (float) $order->total_amount,
            'revenue_net' => (float) $order->organizer_net_amount,
            'platform_fees' => (float) $order->platform_fee_total,
        ]);

        $this->incrementOrganizerStat($order->organizer_id, $statDate, [
            'orders_count' => 1,
            'registrations_count' => $registrationCount,
            'revenue_gross' => (float) $order->total_amount,
            'platform_fees' => (float) $order->platform_fee_total,
        ]);
    }

    public function recordCheckIn(CheckIn $checkIn): void
    {
        $statDate = Carbon::parse($checkIn->checked_in_at ?? now())->toDateString();

        $this->incrementEventStat($checkIn->event_id, $checkIn->organizer_id, $statDate, [
            'check_ins_count' => 1,
        ]);
    }

    /**
     * @param  array<string, float|int>  $increments
     */
    private function incrementEventStat(int $eventId, int $organizerId, string $statDate, array $increments): void
    {
        $stat = DailyEventStat::query()->firstOrCreate(
            ['event_id' => $eventId, 'stat_date' => $statDate],
            [
                'organizer_id' => $organizerId,
                'orders_count' => 0,
                'registrations_count' => 0,
                'revenue_gross' => 0,
                'revenue_net' => 0,
                'platform_fees' => 0,
                'check_ins_count' => 0,
            ]
        );

        foreach ($increments as $column => $value) {
            $stat->increment($column, $value);
        }
    }

    /**
     * @param  array<string, float|int>  $increments
     */
    private function incrementOrganizerStat(int $organizerId, string $statDate, array $increments): void
    {
        $eventsActive = Event::withoutOrganizerScope()
            ->where('organizer_id', $organizerId)
            ->whereIn('status', ['published', 'live'])
            ->count();

        $stat = DailyOrganizerStat::query()->firstOrCreate(
            ['organizer_id' => $organizerId, 'stat_date' => $statDate],
            [
                'events_active' => $eventsActive,
                'orders_count' => 0,
                'registrations_count' => 0,
                'revenue_gross' => 0,
                'platform_fees' => 0,
            ]
        );

        $stat->update(['events_active' => $eventsActive]);

        foreach ($increments as $column => $value) {
            $stat->increment($column, $value);
        }
    }
}
