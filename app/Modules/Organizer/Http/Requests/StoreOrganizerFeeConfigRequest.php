<?php

namespace App\Modules\Organizer\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrganizerFeeConfigRequest extends FormRequest
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
            'fee_type' => ['required', 'string', Rule::in(['percentage', 'flat', 'both'])],
            'percentage_rate' => ['required', 'numeric', 'min:0', 'max:100'],
            'flat_amount' => ['required', 'numeric', 'min:0'],
            'fee_bearer' => ['required', 'string', Rule::in(['attendee', 'organizer'])],
            'effective_from' => ['required', 'date'],
            'effective_until' => ['nullable', 'date', 'after:effective_from'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
