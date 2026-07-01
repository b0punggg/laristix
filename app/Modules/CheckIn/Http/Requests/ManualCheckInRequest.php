<?php

namespace App\Modules\CheckIn\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ManualCheckInRequest extends FormRequest
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
            'ticket_code' => ['required', 'string', 'max:32'],
            'gate_id' => ['nullable', 'integer', 'exists:check_in_gates,id'],
            'device_info' => ['nullable', 'string', 'max:255'],
        ];
    }
}
