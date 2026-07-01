<?php

namespace App\Modules\Order\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistrationResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'seat_index' => $this->seat_index,
            'attendee_name' => $this->attendee_name,
            'attendee_email' => $this->attendee_email,
            'status' => $this->status,
            'ticket' => $this->whenLoaded('ticket', fn () => [
                'uuid' => $this->ticket->uuid,
                'ticket_code' => $this->ticket->ticket_code,
                'status' => $this->ticket->status,
                'issued_at' => $this->ticket->issued_at?->toIso8601String(),
            ]),
        ];
    }
}
