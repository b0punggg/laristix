<?php

namespace App\Modules\Admin\Contracts;

use App\Modules\Auth\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface AuditLogServiceInterface
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
    ): void;

    public function listForAdmin(User $admin, array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
