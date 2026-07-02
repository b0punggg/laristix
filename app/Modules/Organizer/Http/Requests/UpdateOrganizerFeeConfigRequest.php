<?php

namespace App\Modules\Organizer\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrganizerFeeConfigRequest extends FormRequest
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
            'fee_type' => ['sometimes', 'string', Rule::in(['percentage', 'flat', 'both'])],
            'percentage_rate' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'flat_amount' => ['sometimes', 'numeric', 'min:0'],
            'fee_bearer' => ['sometimes', 'string', Rule::in(['attendee', 'organizer'])],
            'effective_from' => ['sometimes', 'date'],
            'effective_until' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
