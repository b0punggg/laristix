<?php

namespace App\Modules\Admin\Services;

use App\Modules\Admin\Contracts\ActivityLogServiceInterface;
use App\Modules\Admin\Models\ActivityLog;
use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ActivityLogService implements ActivityLogServiceInterface
{
    public function record(
        string $action,
        string $subjectType,
        int $subjectId,
        ?User $user = null,
        ?int $organizerId = null,
        ?array $properties = null,
    ): void {
        ActivityLog::query()->create([
            'organizer_id' => $organizerId,
            'user_id' => $user?->id,
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'properties' => $properties,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function listForAdmin(User $admin, array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $this->assertSuperAdmin($admin);

        $query = ActivityLog::query()
            ->with(['user:id,name,email', 'organizer:id,name,slug'])
            ->orderByDesc('created_at');

        if (! empty($filters['action'])) {
            $query->where('action', 'like', '%'.$filters['action'].'%');
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
