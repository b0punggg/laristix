<?php

namespace App\Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateCheckoutRequest extends FormRequest
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
            'ticket_type_id' => ['required', 'integer', 'min:1'],
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
            'buyer_name' => ['required', 'string', 'max:255'],
            'buyer_email' => ['required', 'email', 'max:255'],
            'buyer_phone' => ['nullable', 'string', 'max:30'],
            'buyer_id_number' => ['nullable', 'string', 'max:32'],
            'buyer_date_of_birth' => ['nullable', 'date'],
            'buyer_gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
            'answers' => ['sometimes', 'array'],
            'answers.*.field_id' => ['required', 'integer', 'min:1'],
            'answers.*.value' => ['nullable'],
            'attendees' => ['sometimes', 'array'],
            'attendees.*.name' => ['required', 'string', 'max:255'],
            'attendees.*.email' => ['nullable', 'email', 'max:255'],
            'attendees.*.phone' => ['nullable', 'string', 'max:30'],
            'attendees.*.id_number' => ['nullable', 'string', 'max:32'],
            'attendees.*.date_of_birth' => ['nullable', 'date'],
            'attendees.*.gender' => ['nullable', 'string', Rule::in(['male', 'female', 'other'])],
            'attendees.*.answers' => ['sometimes', 'array'],
            'attendees.*.answers.*.field_id' => ['required', 'integer', 'min:1'],
            'attendees.*.answers.*.value' => ['nullable'],
        ];
    }
}
