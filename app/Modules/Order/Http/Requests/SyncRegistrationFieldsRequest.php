<?php

namespace App\Modules\Order\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SyncRegistrationFieldsRequest extends FormRequest
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
            'fields' => ['required', 'array'],
            'fields.*.label' => ['required', 'string', 'max:255'],
            'fields.*.name' => ['nullable', 'string', 'max:100'],
            'fields.*.type' => ['required', 'string', Rule::in(['text', 'email', 'phone', 'textarea', 'select', 'checkbox'])],
            'fields.*.placeholder' => ['nullable', 'string', 'max:255'],
            'fields.*.help_text' => ['nullable', 'string', 'max:500'],
            'fields.*.is_required' => ['sometimes', 'boolean'],
            'fields.*.sort_order' => ['sometimes', 'integer', 'min:0'],
            'fields.*.is_active' => ['sometimes', 'boolean'],
            'fields.*.options' => ['sometimes', 'array'],
            'fields.*.options.*.label' => ['required_with:fields.*.options', 'string', 'max:255'],
            'fields.*.options.*.value' => ['nullable', 'string', 'max:255'],
        ];
    }
}
