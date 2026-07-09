<?php

namespace App\Modules\Event\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventWithdrawalServiceInterface;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Models\EventWithdrawal;
use App\Modules\Order\Enums\OrderStatus;
use App\Modules\Order\Models\Order;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class EventWithdrawalService implements EventWithdrawalServiceInterface
{
    /** @var list<string> */
    private const PAID_STATUSES = [OrderStatus::PAID, OrderStatus::COMPLETED];

    /** @var list<string> */
    private const RESERVED_WITHDRAWAL_STATUSES = ['pending', 'processing'];

    public function __construct(
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function list(Event $event, Organizer $organizer, User $user): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        return $this->buildResponse($event);
    }

    public function create(Event $event, Organizer $organizer, User $user, array $payload): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $summary = $this->buildFinanceSummary($event);
        $amount = round((float) ($payload['amount'] ?? 0), 2);

        if ($amount <= 0) {
            throw ValidationException::withMessages([
                'amount' => ['Nominal penarikan harus lebih dari nol.'],
            ]);
        }

        if ($amount > $summary['available_balance']) {
            throw ValidationException::withMessages([
                'amount' => ['Nominal penarikan melebihi dana yang tersedia.'],
            ]);
        }

        $withdrawal = EventWithdrawal::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'amount' => $amount,
            'status' => 'pending',
            'bank_name' => trim((string) $payload['bank_name']),
            'account_holder' => trim((string) $payload['account_holder']),
            'account_number' => trim((string) $payload['account_number']),
            'notes' => isset($payload['notes']) && trim((string) $payload['notes']) !== ''
                ? trim((string) $payload['notes'])
                : null,
            'requested_at' => now(),
            'status_history' => [[
                'status' => 'pending',
                'label' => $this->statusLabel('pending'),
                'at' => now()->toIso8601String(),
                'notes' => isset($payload['notes']) && trim((string) $payload['notes']) !== ''
                    ? trim((string) $payload['notes'])
                    : null,
            ]],
        ]);

        return $this->transformWithdrawal($withdrawal);
    }

    /**
     * @return array{
     *   available_balance: float,
     *   pending_balance: float,
     *   withdrawn_total: float,
     *   quotation_total: float
     * }
     */
    private function buildFinanceSummary(Event $event): array
    {
        $revenueNet = (float) Order::query()
            ->where('event_id', $event->id)
            ->whereIn('status', self::PAID_STATUSES)
            ->sum('organizer_net_amount');

        $quotationTotal = $this->quotationTotal($event);

        $pendingBalance = (float) EventWithdrawal::query()
            ->where('event_id', $event->id)
            ->whereIn('status', self::RESERVED_WITHDRAWAL_STATUSES)
            ->sum('amount');

        $withdrawnTotal = (float) EventWithdrawal::query()
            ->where('event_id', $event->id)
            ->where('status', 'paid')
            ->sum('amount');

        return [
            'available_balance' => max(0, round($revenueNet - $quotationTotal - $pendingBalance - $withdrawnTotal, 2)),
            'pending_balance' => $pendingBalance,
            'withdrawn_total' => $withdrawnTotal,
            'quotation_total' => $quotationTotal,
        ];
    }

    /**
     * @return array{
     *   available_balance: float,
     *   pending_balance: float,
     *   withdrawn_total: float,
     *   data: list<array<string, mixed>>
     * }
     */
    private function buildResponse(Event $event): array
    {
        $summary = $this->buildFinanceSummary($event);

        $rows = EventWithdrawal::query()
            ->where('event_id', $event->id)
            ->orderByDesc('requested_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (EventWithdrawal $withdrawal) => $this->transformWithdrawal($withdrawal))
            ->values()
            ->all();

        return [
            'available_balance' => $summary['available_balance'],
            'pending_balance' => $summary['pending_balance'],
            'withdrawn_total' => $summary['withdrawn_total'],
            'data' => $rows,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function transformWithdrawal(EventWithdrawal $withdrawal): array
    {
        return [
            'uuid' => $withdrawal->uuid,
            'amount' => (float) $withdrawal->amount,
            'status' => $withdrawal->status,
            'status_label' => $this->statusLabel($withdrawal->status),
            'bank_name' => $withdrawal->bank_name,
            'account_holder' => $withdrawal->account_holder,
            'account_number' => $withdrawal->account_number,
            'invoice_number' => $withdrawal->invoice_number,
            'invoice_url' => $withdrawal->invoice_url,
            'supporting_document_url' => $withdrawal->supporting_document_url,
            'transfer_proof_url' => $withdrawal->transfer_proof_url,
            'status_history' => $withdrawal->status_history ?? [],
            'notes' => $withdrawal->notes,
            'requested_at' => $withdrawal->requested_at?->toIso8601String(),
            'processed_at' => $withdrawal->processed_at?->toIso8601String(),
            'created_at' => $withdrawal->created_at?->toIso8601String(),
        ];
    }

    private function quotationTotal(Event $event): float
    {
        $settings = is_array($event->settings) ? $event->settings : [];
        $finance = isset($settings['finance']) && is_array($settings['finance']) ? $settings['finance'] : [];

        return round(max(0, (float) ($finance['quotation_amount'] ?? 0)), 2);
    }

    private function statusLabel(string $status): string
    {
        return match ($status) {
            'pending' => 'Menunggu diproses',
            'processing' => 'Sedang diproses',
            'paid' => 'Berhasil ditransfer',
            'rejected' => 'Ditolak',
            default => $status,
        };
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
