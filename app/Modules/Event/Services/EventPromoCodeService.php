<?php

namespace App\Modules\Event\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventPromoCodeServiceInterface;
use App\Modules\Event\Models\Event;
use App\Modules\Order\Models\PromoCode;
use App\Modules\Organizer\Enums\OrganizerMemberRole;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerMemberRepositoryInterface;
use Illuminate\Validation\ValidationException;

class EventPromoCodeService implements EventPromoCodeServiceInterface
{
    public function __construct(
        private readonly OrganizerMemberRepositoryInterface $members,
    ) {}

    public function list(Event $event, Organizer $organizer, User $user): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        return PromoCode::withoutOrganizerScope()
            ->where('organizer_id', $organizer->id)
            ->where(function ($query) use ($event) {
                $query->whereNull('event_id')
                    ->orWhere('event_id', $event->id);
            })
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (PromoCode $promo) => $this->transform($promo))
            ->values()
            ->all();
    }

    public function store(Event $event, Organizer $organizer, User $user, array $data): array
    {
        $this->assertMemberOrSuperAdmin($organizer, $user);
        $this->assertNotScanner($organizer, $user);

        $code = strtoupper(trim((string) $data['code']));

        $exists = PromoCode::withoutOrganizerScope()
            ->where('organizer_id', $organizer->id)
            ->whereRaw('UPPER(code) = ?', [$code])
            ->exists();

        if ($exists) {
            throw ValidationException::withMessages([
                'code' => ['Kode promo sudah digunakan.'],
            ]);
        }

        $promo = PromoCode::withoutOrganizerScope()->create([
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'code' => $code,
            'description' => $data['description'] ?? null,
            'discount_type' => $data['discount_type'],
            'discount_value' => $data['discount_value'],
            'max_discount_amount' => $data['max_discount_amount'] ?? null,
            'usage_limit' => $data['usage_limit'] ?? null,
            'min_order_amount' => $data['min_order_amount'] ?? null,
            'valid_from' => $data['valid_from'] ?? null,
            'valid_until' => $data['valid_until'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return $this->transform($promo);
    }

    /**
     * @return array<string, mixed>
     */
    private function transform(PromoCode $promo): array
    {
        return [
            'id' => $promo->id,
            'code' => $promo->code,
            'description' => $promo->description,
            'discount_type' => $promo->discount_type,
            'discount_value' => (float) $promo->discount_value,
            'max_discount_amount' => $promo->max_discount_amount !== null
                ? (float) $promo->max_discount_amount
                : null,
            'usage_limit' => $promo->usage_limit,
            'usage_count' => (int) $promo->usage_count,
            'min_order_amount' => $promo->min_order_amount !== null
                ? (float) $promo->min_order_amount
                : null,
            'valid_from' => $promo->valid_from?->toIso8601String(),
            'valid_until' => $promo->valid_until?->toIso8601String(),
            'is_active' => (bool) $promo->is_active,
            'event_id' => $promo->event_id,
            'created_at' => $promo->created_at?->toIso8601String(),
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
