<?php

namespace App\Modules\CheckIn\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCheckInGateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:100'],
            'code' => ['required', 'string', 'max:20', 'alpha_dash'],
        ];
    }
}
