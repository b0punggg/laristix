<?php

namespace App\Modules\WaitingRoom\Http\Middleware;

use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use App\Modules\WaitingRoom\Exceptions\WaitingRoomException;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCheckoutQueueAccess
{
    public function __construct(
        private readonly WaitingRoomServiceInterface $waitingRoom,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $eventUuid = (string) $request->route('eventUuid');

        $event = Event::withoutOrganizerScope()
            ->where('uuid', $eventUuid)
            ->whereIn('status', EventStatus::publicVisible())
            ->where('visibility', 'public')
            ->first();

        if ($event === null) {
            return $next($request);
        }

        $this->waitingRoom->recordCheckoutAttempt($event->id);
        $this->waitingRoom->activateQueueIfNeeded($event->id);

        if (! $this->waitingRoom->isQueueActive($event->id)) {
            return $next($request);
        }

        $sessionToken = $request->header('X-Queue-Session')
            ?? $request->query('queue_session');

        if ($this->waitingRoom->validateAdmission($event->id, $sessionToken)) {
            return $next($request);
        }

        throw WaitingRoomException::queueRequired(
            'Silakan menunggu giliran Anda sebelum melanjutkan ke checkout.',
            [
                'queue_active' => true,
                'event_uuid' => $event->uuid,
            ],
        );
    }
}
