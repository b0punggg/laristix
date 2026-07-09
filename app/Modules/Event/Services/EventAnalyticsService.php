<?php

namespace App\Modules\Event\Services;

use App\Modules\Admin\Models\DailyEventStat;
use App\Modules\Auth\Models\User;
use App\Modules\CheckIn\Models\CheckIn;
use App\Modules\CheckIn\Models\CheckInGate;
use App\Modules\Event\Contracts\EventAnalyticsServiceInterface;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Order\Models\OrderItem;
use App\Modules\Order\Models\Registration;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use App\Modules\Ticketing\Models\TicketType;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class EventAnalyticsService implements EventAnalyticsServiceInterface
{
    /** @var list<string> */
    private const PAID_STATUSES = [OrderStatus::PAID, OrderStatus::COMPLETED];

    public function __construct(
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function summary(Event $event, Organizer $organizer, User $user): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $eventId = $event->id;
        $today = Carbon::today()->toDateString();

        $ticketCapacity = (int) TicketType::query()
            ->where('event_id', $eventId)
            ->where('status', 'active')
            ->sum('quantity');

        $ticketsSold = (int) OrderItem::query()
            ->where('event_id', $eventId)
            ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::COMPLETED))
            ->sum('quantity');

        $ticketsReserved = (int) TicketType::query()
            ->where('event_id', $eventId)
            ->where('status', 'active')
            ->sum('reserved_count');

        return [
            'event' => $this->eventSummary($event),
            'totals' => [
                'orders_completed' => Order::query()
                    ->where('event_id', $eventId)
                    ->where('status', OrderStatus::COMPLETED)
                    ->count(),
                'tickets_sold' => $ticketsSold,
                'tickets_remaining' => max(0, $ticketCapacity - $ticketsSold - $ticketsReserved),
                'registrations' => Registration::query()
                    ->where('event_id', $eventId)
                    ->whereHas('order', fn ($q) => $q->where('status', OrderStatus::COMPLETED))
                    ->count(),
                'check_ins' => CheckIn::query()
                    ->where('event_id', $eventId)
                    ->count(),
                'revenue_gross' => (float) Order::query()
                    ->where('event_id', $eventId)
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('total_amount'),
                'revenue_net' => (float) Order::query()
                    ->where('event_id', $eventId)
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('organizer_net_amount'),
                'platform_fees' => (float) Order::query()
                    ->where('event_id', $eventId)
                    ->whereIn('status', self::PAID_STATUSES)
                    ->sum('platform_fee_total'),
            ],
            'today' => [
                'orders' => Order::query()
                    ->where('event_id', $eventId)
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->count(),
                'registrations' => Registration::query()
                    ->where('event_id', $eventId)
                    ->whereHas('order', fn ($q) => $q
                        ->whereIn('status', self::PAID_STATUSES)
                        ->whereDate('paid_at', $today))
                    ->count(),
                'revenue_gross' => (float) Order::query()
                    ->where('event_id', $eventId)
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->sum('total_amount'),
                'revenue_net' => (float) Order::query()
                    ->where('event_id', $eventId)
                    ->whereIn('status', self::PAID_STATUSES)
                    ->whereDate('paid_at', $today)
                    ->sum('organizer_net_amount'),
                'check_ins' => CheckIn::query()
                    ->where('event_id', $eventId)
                    ->whereDate('checked_in_at', $today)
                    ->count(),
            ],
        ];
    }

    public function trends(Event $event, Organizer $organizer, User $user, int $days = 30): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $days = max(7, min($days, 90));
        $startDate = Carbon::today()->subDays($days - 1);
        $eventId = $event->id;

        $eventStats = DailyEventStat::query()
            ->where('event_id', $eventId)
            ->where('stat_date', '>=', $startDate->toDateString())
            ->get()
            ->keyBy(fn ($row) => $row->stat_date->toDateString());

        if ($eventStats->isEmpty()) {
            return $this->trendsFromLiveData($eventId, $days, $startDate);
        }

        $series = [];

        for ($i = 0; $i < $days; $i++) {
            $date = $startDate->copy()->addDays($i)->toDateString();
            $row = $eventStats->get($date);

            $series[] = [
                'date' => $date,
                'orders' => (int) ($row->orders_count ?? 0),
                'revenue_gross' => (float) ($row->revenue_gross ?? 0),
                'revenue_net' => (float) ($row->revenue_net ?? 0),
                'platform_fees' => (float) ($row->platform_fees ?? 0),
                'check_ins' => (int) ($row->check_ins_count ?? 0),
            ];
        }

        return [
            'days' => $days,
            'series' => $series,
        ];
    }

    public function insights(Event $event, Organizer $organizer, User $user): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $eventId = $event->id;
        $today = Carbon::today()->toDateString();

        $soldByTicketType = OrderItem::query()
            ->select('ticket_type_id')
            ->selectRaw('COALESCE(SUM(quantity), 0) as sold')
            ->selectRaw('COALESCE(SUM(subtotal), 0) as revenue_gross')
            ->where('event_id', $eventId)
            ->whereHas('order', fn ($q) => $q->whereIn('status', self::PAID_STATUSES))
            ->groupBy('ticket_type_id')
            ->get()
            ->keyBy('ticket_type_id');

        $ticketBreakdown = TicketType::query()
            ->where('event_id', $eventId)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(function (TicketType $ticketType) use ($soldByTicketType) {
                $row = $soldByTicketType->get($ticketType->id);

                return [
                    'ticket_type_id' => $ticketType->id,
                    'name' => $ticketType->name,
                    'sold' => (int) ($row->sold ?? 0),
                    'quantity' => $ticketType->quantity,
                    'remaining' => $ticketType->availableQuantity(),
                    'revenue_gross' => (float) ($row->revenue_gross ?? 0),
                ];
            })
            ->values()
            ->all();

        $recentOrders = Order::query()
            ->where('event_id', $eventId)
            ->whereIn('status', self::PAID_STATUSES)
            ->orderByDesc('paid_at')
            ->limit(10)
            ->get(['uuid', 'order_number', 'buyer_name', 'buyer_email', 'status', 'total_amount', 'organizer_net_amount', 'paid_at'])
            ->map(fn (Order $order) => [
                'uuid' => $order->uuid,
                'order_number' => $order->order_number,
                'buyer_name' => $order->buyer_name,
                'buyer_email' => $order->buyer_email,
                'status' => $order->status,
                'total_amount' => (float) $order->total_amount,
                'organizer_net_amount' => (float) $order->organizer_net_amount,
                'paid_at' => $order->paid_at?->toIso8601String(),
            ])
            ->values()
            ->all();

        $attentionItems = [];

        if (! $event->is_free) {
            TicketType::query()
                ->where('event_id', $eventId)
                ->where('status', 'active')
                ->get()
                ->each(function (TicketType $ticketType) use (&$attentionItems) {
                    if ($ticketType->quantity <= 0) {
                        return;
                    }

                    $remaining = $ticketType->availableQuantity();
                    $threshold = max(5, (int) ceil($ticketType->quantity * 0.1));

                    if ($remaining > 0 && $remaining <= $threshold) {
                        $attentionItems[] = [
                            'type' => 'tickets_low_stock',
                            'message' => "Tiket {$ticketType->name} hampir habis ({$remaining} tersisa).",
                            'ticket_type_id' => $ticketType->id,
                            'ticket_type_name' => $ticketType->name,
                        ];
                    }
                });
        }

        if (
            in_array($event->status, [EventStatus::PUBLISHED, EventStatus::LIVE], true)
            && $event->start_at !== null
            && $event->start_at->between(now(), now()->addHours(48))
            && ! CheckInGate::query()->where('event_id', $eventId)->exists()
        ) {
            $attentionItems[] = [
                'type' => 'no_check_in_gates',
                'message' => 'Event segera dimulai tetapi belum ada gate check-in.',
            ];
        }

        return [
            'ticket_breakdown' => $ticketBreakdown,
            'recent_orders' => $recentOrders,
            'check_in_today' => [
                'count' => CheckIn::query()
                    ->where('event_id', $eventId)
                    ->whereDate('checked_in_at', $today)
                    ->count(),
            ],
            'attention_items' => $attentionItems,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function eventSummary(Event $event): array
    {
        return [
            'uuid' => $event->uuid,
            'title' => $event->title,
            'status' => $event->status,
            'start_at' => $event->start_at?->toIso8601String(),
            'end_at' => $event->end_at?->toIso8601String(),
            'timezone' => $event->timezone,
            'is_free' => $event->is_free,
        ];
    }

    private function trendsFromLiveData(int $eventId, int $days, Carbon $startDate): array
    {
        $orderRows = Order::query()
            ->selectRaw('DATE(paid_at) as stat_date, COUNT(*) as orders_count, SUM(total_amount) as revenue_gross, SUM(organizer_net_amount) as revenue_net, SUM(platform_fee_total) as platform_fees')
            ->where('event_id', $eventId)
            ->whereIn('status', self::PAID_STATUSES)
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', $startDate->startOfDay())
            ->groupBy(DB::raw('DATE(paid_at)'))
            ->get()
            ->keyBy('stat_date');

        $checkInRows = CheckIn::query()
            ->selectRaw('DATE(checked_in_at) as stat_date, COUNT(*) as check_ins_count')
            ->where('event_id', $eventId)
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

    private function assertNotScanner(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $this->members->findActiveMembership($user->id, $organizer->id);

        if ($membership !== null && $membership->role === OrganizerMemberRole::SCANNER) {
            throw OrganizerAccessDeniedException::make('Scanner role cannot access this resource.');
        }
    }
}
