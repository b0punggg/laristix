<?php

namespace App\Modules\Organizer\Repositories\Eloquent;

use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Models\OrganizerMember;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

class OrganizerRepository implements OrganizerRepositoryInterface
{
    public function findById(int $id): ?Organizer
    {
        return Organizer::query()->find($id);
    }

    public function findByUuid(string $uuid): ?Organizer
    {
        return Organizer::query()->where('uuid', $uuid)->first();
    }

    public function create(array $attributes): Organizer
    {
        return Organizer::query()->create($attributes);
    }

    public function update(Organizer $organizer, array $attributes): Organizer
    {
        $organizer->fill($attributes);
        $organizer->save();

        return $organizer->fresh();
    }

    public function slugExists(string $slug, ?int $exceptId = null): bool
    {
        $query = Organizer::query()->where('slug', $slug);

        if ($exceptId !== null) {
            $query->where('id', '!=', $exceptId);
        }

        return $query->exists();
    }

    public function listForUser(int $userId): Collection
    {
        return Organizer::query()
            ->whereHas('members', function ($query) use ($userId) {
                $query->where('user_id', $userId)->where('status', 'active');
            })
            ->orderBy('name')
            ->get();
    }

    public function listPending(): Collection
    {
        return Organizer::query()
            ->where('status', 'pending')
            ->orderBy('created_at')
            ->get();
    }

    public function paginateForPlatform(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Organizer::query()
            ->withCount('events')
            ->with($this->adminMemberRelations())
            ->orderByDesc('created_at');

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('slug', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->paginate($perPage);
    }

    public function findByUuidForAdmin(string $uuid): ?Organizer
    {
        return Organizer::query()
            ->withCount('events')
            ->with(array_merge($this->adminMemberRelations(), ['approvedBy:id,name,email']))
            ->where('uuid', $uuid)
            ->first();
    }

    /**
     * @return array<int|string, mixed>
     */
    private function adminMemberRelations(): array
    {
        return [
            'members' => function ($query) {
                $query->where('role', OrganizerMemberRole::OWNER)
                    ->where('status', 'active')
                    ->with('user:id,name,email');
            },
        ];
    }
}
