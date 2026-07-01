<?php

namespace App\Modules\CheckIn\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScanCheckInRequest extends FormRequest
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
            'qr_token' => ['required', 'string', 'max:256'],
            'gate_id' => ['nullable', 'integer', 'exists:check_in_gates,id'],
            'device_info' => ['nullable', 'string', 'max:255'],
        ];
    }
}
