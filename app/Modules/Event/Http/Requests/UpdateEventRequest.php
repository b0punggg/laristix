<?php

namespace App\Modules\Event\Http\Requests;

use App\Modules\Event\Enums\EventVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEventRequest extends FormRequest
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
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'banner_url' => ['nullable', 'string', 'url', 'max:500'],
            'venue_id' => ['sometimes', 'required', 'integer', 'exists:venues,id'],
            'category_id' => ['sometimes', 'required', 'integer', 'exists:event_categories,id'],
            'start_at' => ['sometimes', 'date'],
            'end_at' => ['sometimes', 'date', 'after:start_at'],
            'timezone' => ['sometimes', 'string', 'max:50', 'timezone'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'is_free' => ['sometimes', 'boolean'],
            'visibility' => ['sometimes', 'string', Rule::in(EventVisibility::values())],
            'settings' => ['sometimes', 'array'],
        ];
    }
}
