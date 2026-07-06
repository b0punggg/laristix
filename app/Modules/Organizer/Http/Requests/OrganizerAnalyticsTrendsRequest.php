<?php

namespace App\Modules\Organizer\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class OrganizerAnalyticsTrendsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'days' => ['sometimes', 'integer', 'min:7', 'max:90'],
        ];
    }
}
