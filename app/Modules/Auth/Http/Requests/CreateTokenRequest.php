<?php

namespace App\Modules\Auth\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'device_name' => ['required', 'string', 'max:255'],
            'type' => ['sometimes', 'string', 'in:scanner,general'],
        ];
    }
}
