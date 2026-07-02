<?php

namespace App\Modules\Admin\Contracts;

use App\Modules\Auth\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface ActivityLogServiceInterface
{
    public function record(
        string $action,
        string $subjectType,
        int $subjectId,
        ?User $user = null,
        ?int $organizerId = null,
        ?array $properties = null,
    ): void;

    public function listForAdmin(User $admin, array $filters = [], int $perPage = 20): LengthAwarePaginator;
}
