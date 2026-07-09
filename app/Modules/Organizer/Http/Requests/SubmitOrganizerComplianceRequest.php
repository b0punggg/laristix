<?php

namespace App\Modules\Organizer\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubmitOrganizerComplianceRequest extends FormRequest
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
            'type' => ['required', 'string', Rule::in(['individual', 'business'])],
            'legal_name' => ['required', 'string', 'max:255'],
            'ktp_number' => ['nullable', 'string', 'max:32'],
            'npwp_number' => ['nullable', 'string', 'max:32'],
        ];
    }
}
