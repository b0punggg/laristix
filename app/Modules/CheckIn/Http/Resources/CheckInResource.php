<?php

namespace App\Modules\CheckIn\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CheckInResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'method' => $this->method,
            'checked_in_at' => $this->checked_in_at?->toIso8601String(),
            'device_info' => $this->device_info,
            'ticket' => $this->whenLoaded('ticket', fn () => [
                'uuid' => $this->ticket->uuid,
                'ticket_code' => $this->ticket->ticket_code,
                'ticket_type' => $this->ticket->ticketType?->name,
            ]),
            'attendee' => $this->whenLoaded('registration', fn () => [
                'name' => $this->registration->attendee_name,
                'email' => $this->registration->attendee_email,
            ]),
            'gate' => $this->whenLoaded('gate', fn () => $this->gate ? [
                'id' => $this->gate->id,
                'name' => $this->gate->name,
                'code' => $this->gate->code,
            ] : null),
            'scanner' => $this->whenLoaded('scanner', fn () => [
                'id' => $this->scanner->id,
                'name' => $this->scanner->name,
            ]),
        ];
    }
}
