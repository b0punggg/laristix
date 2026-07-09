<?php

namespace App\Modules\Event\Http\Controllers\V1;

use App\Core\Http\Controllers\Controller;
use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Event\Contracts\EventPromoCodeServiceInterface;
use App\Modules\Event\Exceptions\EventNotFoundException;
use App\Modules\Event\Repositories\Contracts\EventRepositoryInterface;
use App\Modules\Organizer\Exceptions\OrganizerNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventPromoCodeController extends Controller
{
    public function __construct(
        private readonly EventPromoCodeServiceInterface $promoCodes,
        private readonly EventRepositoryInterface $events,
        private readonly OrganizerContextInterface $organizerContext,
    ) {}

    public function index(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        return response()->json([
            'data' => $this->promoCodes->list($event, $organizer, $user),
        ]);
    }

    public function store(Request $request, string $uuid): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();
        $organizer = $this->requireCurrentOrganizer();
        $event = $this->findEventOrFail($uuid, $organizer->id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string', 'max:255'],
            'discount_type' => ['required', Rule::in(['percentage', 'fixed'])],
            'discount_value' => ['required', 'numeric', 'min:0.01'],
            'max_discount_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        if ($validated['discount_type'] === 'percentage' && (float) $validated['discount_value'] > 100) {
            return response()->json([
                'message' => 'Diskon persentase tidak boleh lebih dari 100%.',
                'errors' => ['discount_value' => ['Diskon persentase tidak boleh lebih dari 100%.']],
            ], 422);
        }

        $promo = $this->promoCodes->store($event, $organizer, $user, $validated);

        return response()->json(['data' => $promo], 201);
    }

    private function findEventOrFail(string $uuid, int $organizerId)
    {
        $event = $this->events->findByUuidForOrganizer($uuid, $organizerId);

        if ($event === null) {
            throw EventNotFoundException::make();
        }

        return $event;
    }

    private function requireCurrentOrganizer()
    {
        $organizer = $this->organizerContext->organizer();

        if ($organizer === null) {
            throw OrganizerNotFoundException::make();
        }

        return $organizer;
    }
}
