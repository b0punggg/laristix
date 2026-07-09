<?php

namespace App\Modules\Admin\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Admin\Http\Requests\UploadWithdrawalDocumentRequest;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Models\EventWithdrawal;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminWithdrawalController extends Controller
{
    public function __construct(
        private readonly AuditLogServiceInterface $auditLogs,
    ) {}

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertSuperAdmin($user);

        $withdrawals = EventWithdrawal::withoutOrganizerScope()
            ->with(['event:id,uuid,title', 'organizer:id,uuid,name,slug'])
            ->orderByRaw("CASE status WHEN 'pending' THEN 1 WHEN 'processing' THEN 2 WHEN 'paid' THEN 3 WHEN 'rejected' THEN 4 ELSE 5 END")
            ->orderByDesc('requested_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (EventWithdrawal $withdrawal) => [
                'uuid' => $withdrawal->uuid,
                'amount' => (float) $withdrawal->amount,
                'status' => $withdrawal->status,
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
                'event' => $withdrawal->event ? [
                    'uuid' => $withdrawal->event->uuid,
                    'title' => $withdrawal->event->title,
                ] : null,
                'organizer' => $withdrawal->organizer ? [
                    'uuid' => $withdrawal->organizer->uuid,
                    'name' => $withdrawal->organizer->name,
                    'slug' => $withdrawal->organizer->slug,
                ] : null,
            ])
            ->values();

        return response()->json(['data' => $withdrawals]);
    }

    public function update(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertSuperAdmin($user);

        $validated = $request->validate([
            'status' => ['required', 'string', 'in:pending,processing,paid,rejected'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:255'],
            'invoice_number' => ['sometimes', 'nullable', 'string', 'max:100'],
            'invoice_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'supporting_document_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'transfer_proof_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
        ]);

        $withdrawal = EventWithdrawal::withoutOrganizerScope()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $oldStatus = $withdrawal->status;
        $newStatus = $validated['status'];
        $history = is_array($withdrawal->status_history) ? $withdrawal->status_history : [];
        $history[] = [
            'status' => $newStatus,
            'label' => $this->statusLabel($newStatus),
            'at' => now()->toIso8601String(),
            'notes' => $validated['notes'] ?? null,
        ];

        $withdrawal->fill([
            'status' => $newStatus,
            'notes' => array_key_exists('notes', $validated) ? $validated['notes'] : $withdrawal->notes,
            'invoice_number' => array_key_exists('invoice_number', $validated) ? $validated['invoice_number'] : $withdrawal->invoice_number,
            'invoice_url' => array_key_exists('invoice_url', $validated) ? $validated['invoice_url'] : $withdrawal->invoice_url,
            'supporting_document_url' => array_key_exists('supporting_document_url', $validated) ? $validated['supporting_document_url'] : $withdrawal->supporting_document_url,
            'transfer_proof_url' => array_key_exists('transfer_proof_url', $validated) ? $validated['transfer_proof_url'] : $withdrawal->transfer_proof_url,
            'status_history' => $history,
            'processed_at' => in_array($newStatus, ['paid', 'rejected'], true)
                ? ($withdrawal->processed_at ?? now())
                : null,
        ]);
        $withdrawal->save();

        $this->auditLogs->record(
            category: 'admin',
            event: 'withdrawal.status_updated',
            user: $user,
            auditable: $withdrawal,
            oldValues: ['status' => $oldStatus],
            newValues: ['status' => $newStatus],
            metadata: [
                'event_id' => $withdrawal->event_id,
                'organizer_id' => $withdrawal->organizer_id,
            ],
        );

        return response()->json([
            'message' => 'Withdrawal status updated.',
            'data' => [
                'uuid' => $withdrawal->uuid,
                'status' => $withdrawal->status,
                'notes' => $withdrawal->notes,
                'invoice_number' => $withdrawal->invoice_number,
                'invoice_url' => $withdrawal->invoice_url,
                'supporting_document_url' => $withdrawal->supporting_document_url,
                'transfer_proof_url' => $withdrawal->transfer_proof_url,
                'status_history' => $withdrawal->status_history ?? [],
                'processed_at' => $withdrawal->processed_at?->toIso8601String(),
            ],
        ]);
    }

    public function uploadDocument(UploadWithdrawalDocumentRequest $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $this->assertSuperAdmin($user);

        $withdrawal = EventWithdrawal::withoutOrganizerScope()
            ->where('uuid', $uuid)
            ->firstOrFail();

        $type = $request->validated('type');
        $path = $request->file('document')->store(
            "withdrawal-documents/{$withdrawal->organizer_id}/{$withdrawal->event_id}",
            'public',
        );
        $url = asset('storage/'.$path);

        $column = match ($type) {
            'invoice' => 'invoice_url',
            'supporting_document' => 'supporting_document_url',
            'transfer_proof' => 'transfer_proof_url',
            default => null,
        };

        if ($column !== null) {
            $withdrawal->fill([$column => $url]);
            $withdrawal->save();
        }

        return response()->json([
            'message' => 'Withdrawal document uploaded.',
            'data' => [
                'type' => $type,
                'url' => $url,
            ],
        ]);
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

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
