<?php

namespace App\Modules\Event\Http\Requests;

class AdminListEventsRequest extends ListEventsRequest
{
    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return array_merge(parent::rules(), [
            'organizer_id' => ['sometimes', 'integer', 'exists:organizers,id'],
        ]);
    }
}
