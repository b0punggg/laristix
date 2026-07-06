<?php

namespace App\Modules\Organizer\Services;

use App\Modules\Admin\Models\DailyEventStat;
use App\Modules\Admin\Models\DailyOrganizerStat;
use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\CheckIn\Models\CheckInGate;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\Registration;
use App\Modules\Organizer\Contracts\OrganizerAnalyticsServiceInterface;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class OrganizerAnalyticsService implements OrganizerAnalyticsServiceInterface
{
    /** @var list<string> */
    private const PAID_STATUSES = [OrderStatus::PAID, OrderStatus::COMPLETED];

    public function __construct(
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function summary(Organizer $organizer, User $user): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);

        $today = Carbon::today()->toDateString();

        return [
            'totals' => [
                'events' => Event::query()->count(),
                'events_published' => Event::query()
                    ->whereIn('status', [EventStatus::PUBLISHED, EventStatus::LIVE])
                    ->count(),
                'events_draft' => Event::query()
                    ->where('status', EventStatus::DRAFT)
                    ->count(),
                'orders_completed' => Order::query()
                    ->where('status', OrderStatus::COMPLETED)
                    ->count(),
                'tickets_sold' => (int) OrderItem::query()
                    ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::COMPLETED))
                    ->sum('quantity'),
                'registrations' => Registration::query()
                    ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::COMPLETED))
                    ->count(),
                'check_ins' => CheckIn::query()->count(),
                'revenue_gross' => (float) Order::query()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('total_amount'),
                'revenue_net' => (float) Order::query()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('organizer_net_amount'),
                'platform_fees' => (float) Order::query()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('platform_fee_total'),
            ],
            'today' => [
                'orders' => Order::query()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->count(),
                'registrations' => Registration::query()
                    ->whereHas('order', fn ($q) => $q
                        ->whereIn('status', self::PAID_STATUSES)
                        ->whereDate('paid_at', $today))
                    ->count(),
                'revenue_gross' => (float) Order::query()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->sum('total_amount'),
                'revenue_net' => (float) Order::query()
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->sum('organizer_net_amount'),
                'check_ins' => CheckIn::query()
                    ->whereDate('checked_in_at', $today)
                    ->count(),
            ],
        ];
    }

    public function trends(Organizer $organizer, User $user, int $days = 30): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);

        $days = max(7, min($days, 90));
        $startDate = Carbon::today()->subDays($days - 1);

        $organizerStats = DailyOrganizerStat::query()
            ->where('organizer_id', $organizer->id)
            ->where('stat_date', '>=', $startDate->toDateString())
            ->get()
            ->keyBy(fn ($row) => $row->stat_date->toDateString());

        $checkInStats = DailyEventStat::query()
            ->where('organizer_id', $organizer->id)
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
                'revenue_net' => (float) ($orgRow->revenue_gross ?? 0) - (float) ($orgRow->platform_fees ?? 0),
                'platform_fees' => (float) ($orgRow->platform_fees ?? 0),
                'check_ins' => (int) ($checkInRow->check_ins_count ?? 0),
            ];
        }

        return [
            'days' => $days,
            'series' => $series,
        ];
    }

    public function insights(Organizer $organizer, User $user): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);

        $today = Carbon::today()->toDateString();
        $eventIdsWithGates = CheckInGate::query()->pluck('event_id');

        $upcomingEvents = Event::query()
            ->with('venue:id,name,city')
            ->whereNotIn('status', [EventStatus::CANCELLED, EventStatus::COMPLETED])
            ->where('end_at', '>=', now())
            ->orderBy('start_at')
            ->limit(5)
            ->get()
            ->map(fn (Event $event) => $this->eventInsight($event))
            ->values()
            ->all();

        $attentionItems = [];

        Event::query()
            ->with('venue:id,name,city')
            ->where('status', EventStatus::DRAFT)
            ->orderBy('start_at')
            ->limit(5)
            ->get()
            ->each(function (Event $event) use (&$attentionItems) {
                $attentionItems[] = [
                    'type' => 'draft_pending_publish',
                    'message' => 'Event masih draft dan belum dipublish.',
                    'event' => $this->eventInsight($event),
                ];
            });

        Event::query()
            ->with('venue:id,name,city')
            ->whereIn('status', [EventStatus::PUBLISHED, EventStatus::LIVE])
            ->where('is_free', false)
            ->whereDoesntHave('ticketTypes', fn ($query) => $query->where('status', 'active'))
            ->orderBy('start_at')
            ->limit(5)
            ->get()
            ->each(function (Event $event) use (&$attentionItems) {
                $attentionItems[] = [
                    'type' => 'no_ticket_types',
                    'message' => 'Event berbayar belum memiliki tipe tiket aktif.',
                    'event' => $this->eventInsight($event),
                ];
            });

        Event::query()
            ->with('venue:id,name,city')
            ->whereIn('status', [EventStatus::PUBLISHED, EventStatus::LIVE])
            ->whereBetween('start_at', [now(), now()->addHours(48)])
            ->whereNotIn('id', $eventIdsWithGates)
            ->orderBy('start_at')
            ->limit(5)
            ->get()
            ->each(function (Event $event) use (&$attentionItems) {
                $attentionItems[] = [
                    'type' => 'no_check_in_gates',
                    'message' => 'Event segera dimulai tetapi belum ada gate check-in.',
                    'event' => $this->eventInsight($event),
                ];
            });

        $topEventRows = Order::query()
            ->select('event_id')
            ->selectRaw('SUM(organizer_net_amount) as revenue_net')
            ->selectRaw('SUM(total_amount) as revenue_gross')
            ->selectRaw('COUNT(*) as orders_count')
            ->whereIn('status', self::PAID_STATUSES)
            ->groupBy('event_id')
            ->orderByDesc('revenue_net')
            ->limit(3)
            ->get();

        $eventsById = Event::query()
            ->with('venue:id,name,city')
            ->whereIn('id', $topEventRows->pluck('event_id'))
            ->get()
            ->keyBy('id');

        $topEventsByRevenue = $topEventRows
            ->map(function ($row) use ($eventsById) {
                $event = $eventsById->get($row->event_id);

                if ($event === null) {
                    return null;
                }

                return [
                    'event' => $this->eventInsight($event),
                    'revenue_net' => (float) $row->revenue_net,
                    'revenue_gross' => (float) $row->revenue_gross,
                    'orders_count' => (int) $row->orders_count,
                ];
            })
            ->filter()
            ->values()
            ->all();

        return [
            'check_in_today' => [
                'count' => CheckIn::query()->whereDate('checked_in_at', $today)->count(),
            ],
            'upcoming_events' => $upcomingEvents,
            'attention_items' => $attentionItems,
            'top_events_by_revenue' => $topEventsByRevenue,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function eventInsight(Event $event): array
    {
        return [
            'uuid' => $event->uuid,
            'title' => $event->title,
            'status' => $event->status,
            'start_at' => $event->start_at?->toIso8601String(),
            'end_at' => $event->end_at?->toIso8601String(),
            'timezone' => $event->timezone,
            'is_free' => $event->is_free,
            'venue_city' => $event->venue?->city,
        ];
    }

    private function trendsFromLiveData(int $days, Carbon $startDate): array
    {
        $orderRows = Order::query()
            ->selectRaw('DATE(paid_at) as stat_date, COUNT(*) as orders_count, SUM(total_amount) as revenue_gross, SUM(organizer_net_amount) as revenue_net, SUM(platform_fee_total) as platform_fees')
            ->whereIn('status', self::PAID_STATUSES)
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', $startDate->startOfDay())
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->get()
            ->keyBy('stat_date');

        $checkInRows = CheckIn::query()
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
                'revenue_net' => (float) ($orderRow->revenue_net ?? 0),
                'platform_fees' => (float) ($orderRow->platform_fees ?? 0),
                'check_ins' => (int) ($checkInRow->check_ins_count ?? 0),
            ];
        }

        return [
            'days' => $days,
            'series' => $series,
        ];
    }

    private function assertMemberOrSuperAdmin(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        if ($this->members->findActiveMembership($user->id, $organizer->id) === null) {
            throw OrganizerAccessDeniedException::make();
        }
    }
}
