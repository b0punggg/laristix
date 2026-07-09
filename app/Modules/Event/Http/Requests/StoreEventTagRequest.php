<?php

namespace App\Modules\Event\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreEventTagRequest extends FormRequest
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
            'slug' => ['nullable', 'string', 'max:100', 'alpha_dash'],
        ];
    }
}
