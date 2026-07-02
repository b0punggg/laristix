<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Contracts\AdminAnalyticsServiceInterface;
use App\Modules\Admin\Models\DailyEventStat;
use App\Modules\Admin\Models\DailyOrganizerStat;
use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\Registration;
use App\Modules\Organizer\Enums\OrganizerStatus;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AdminAnalyticsService implements AdminAnalyticsServiceInterface
{
    /** @var list<string> */
    private const PAID_STATUSES = [OrderStatus::PAID, OrderStatus::COMPLETED];

    public function summary(User $admin): array
    {
        $this->assertSuperAdmin($admin);

        $today = Carbon::today()->toDateString();

        return [
            'totals' => [
                'events' => Event::withoutOrganizerScope()->count(),
                'organizers_active' => Organizer::query()->where('status', OrganizerStatus::ACTIVE)->count(),
                'organizers_pending' => Organizer::query()->where('status', OrganizerStatus::PENDING)->count(),
                'orders_completed' => Order::withoutOrganizerScope()->where('status', OrderStatus::COMPLETED)->count(),
                'tickets_sold' => (int) OrderItem::withoutOrganizerScope()
                    ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::COMPLETED))
                    ->sum('quantity'),
                'registrations' => Registration::withoutOrganizerScope()
                    ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::COMPLETED))
                    ->count(),
                'check_ins' => CheckIn::withoutOrganizerScope()->count(),
                'revenue_gross' => (float) Order::withoutOrganizerScope()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('total_amount'),
                'platform_fees' => (float) Order::withoutOrganizerScope()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('platform_fee_total'),
            ],
            'today' => [
                'orders' => Order::withoutOrganizerScope()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->count(),
                'revenue_gross' => (float) Order::withoutOrganizerScope()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->sum('total_amount'),
                'check_ins' => CheckIn::withoutOrganizerScope()
                    ->whereDate('checked_in_at', $today)
                    ->count(),
            ],
        ];
    }

    public function trends(User $admin, int $days = 30): array
    {
        $this->assertSuperAdmin($admin);

        $days = max(7, min($days, 90));
        $startDate = Carbon::today()->subDays($days - 1);

        $organizerStats = DailyOrganizerStat::query()
            ->selectRaw('stat_date, SUM(orders_count) as orders_count, SUM(revenue_gross) as revenue_gross, SUM(platform_fees) as platform_fees')
            ->where('stat_date', '>=', $startDate->toDateString())
            ->groupBy('stat_date')
            ->get()
            ->keyBy(fn ($row) => $row->stat_date->toDateString());

        $checkInStats = DailyEventStat::query()
            ->selectRaw('stat_date, SUM(check_ins_count) as check_ins_count')
            ->where('stat_date', '>=', $startDate->toDateString())
            ->groupBy('stat_date')
            ->get()
            ->keyBy(fn ($row) => $row->stat_date->toDateString());

        if ($organizerStats->isEmpty()) {
            return $this->trendsFromLiveData($days, $startDate);
        }

        $series = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            $orgRow = $organizerStats->get($date);
            $checkInRow = $checkInStats->get($date);

            $series[] = [
                'date' => $date,
                'orders' => (int) ($orgRow->orders_count ?? 0),
                'revenue_gross' => (float) ($orgRow->revenue_gross ?? 0),
                'platform_fees' => (float) ($orgRow->platform_fees ?? 0),
                'check_ins' => (int) ($checkInRow->check_ins_count ?? 0),
            ];
        }

        return [
            'days' => $days,
            'series' => $series,
        ];
    }

    private function trendsFromLiveData(int $days, Carbon $startDate): array
    {
        $orderRows = Order::withoutOrganizerScope()
            ->selectRaw('DATE(paid_at) as stat_date, COUNT(*) as orders_count, SUM(total_amount) as revenue_gross, SUM(platform_fee_total) as platform_fees')
            ->whereIn('status', self::PAID_STATUSES)
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', $startDate->startOfDay())
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->get()
            ->keyBy('stat_date');

        $checkInRows = CheckIn::withoutOrganizerScope()
            ->selectRaw('DATE(checked_in_at) as stat_date, COUNT(*) as check_ins_count')
            ->where('checked_in_at', '>=', $startDate->startOfDay())
            ->groupBy(DB::raw('DATE(checked_in_at)'))
            ->get()
            ->keyBy('stat_date');

        $series = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            $orderRow = $orderRows->get($date);
            $checkInRow = $checkInRows->get($date);

            $series[] = [
                'date' => $date,
                'orders' => (int) ($orderRow->orders_count ?? 0),
                'revenue_gross' => (float) ($orderRow->revenue_gross ?? 0),
                'platform_fees' => (float) ($orderRow->platform_fees ?? 0),
                'check_ins' => (int) ($checkInRow->check_ins_count ?? 0),
            ];
        }

        return [
            'days' => $days,
            'series' => $series,
        ];
    }

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
