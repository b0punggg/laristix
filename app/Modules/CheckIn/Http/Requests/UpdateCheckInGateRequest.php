<?php

namespace App\Modules\CheckIn\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCheckInGateRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:100'],
            'code' => ['sometimes', 'string', 'max:20', 'alpha_dash'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
