<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Contracts\AuditLogServiceInterface;
use App\Modules\Admin\Models\AuditLog;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class AuditLogService implements AuditLogServiceInterface
{
    public function record(
        string $category,
        string $event,
        ?User $user = null,
        ?Model $auditable = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?array $metadata = null,
        ?int $organizerId = null,
    ): void {
        AuditLog::query()->create([
            'organizer_id' => $organizerId,
            'user_id' => $user?->id,
            'category' => $category,
            'event' => $event,
            'auditable_type' => $auditable !== null ? $auditable::class : null,
            'auditable_id' => $auditable?->getKey(),
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'metadata' => $metadata,
            'ip_address' => request()->ip(),
            'request_id' => (string) Str::uuid(),
            'created_at' => now(),
        ]);
    }

    public function listForAdmin(User $admin, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $this->assertSuperAdmin($admin);

        $query = AuditLog::query()
            ->with(['user:id,name,email', 'organizer:id,name,slug'])
            ->orderByDesc('created_at');

        if (! empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (! empty($filters['event'])) {
            $query->where('event', 'like', '%'.$filters['event'].'%');
        }

        if (! empty($filters['organizer_id'])) {
            $query->where('organizer_id', $filters['organizer_id']);
        }

        return $query->paginate($perPage);
    }

    private function assertSuperAdmin(User $user): void
    {
        if (! $user->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make('Super admin access required.');
        }
    }
}
