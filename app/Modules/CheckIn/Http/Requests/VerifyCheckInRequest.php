<?php

namespace App\Modules\CheckIn\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyCheckInRequest extends FormRequest
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
        ];
    }
}
