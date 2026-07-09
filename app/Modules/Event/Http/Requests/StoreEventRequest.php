<?php

namespace App\Modules\Event\Http\Requests;

use App\Modules\Event\Enums\EventVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEventRequest extends FormRequest
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
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash'],
            'description' => ['nullable', 'string'],
            'short_description' => ['nullable', 'string', 'max:500'],
            'venue_id' => ['required', 'integer', 'exists:venues,id'],
            'category_id' => ['required_without:category_ids', 'integer', 'exists:event_categories,id'],
            'category_ids' => ['sometimes', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'exists:event_categories,id'],
            'tag_ids' => ['sometimes', 'array'],
            'tag_ids.*' => ['integer', 'exists:event_tags,id'],
            'start_at' => ['required', 'date', 'after:now'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'timezone' => ['required', 'string', 'max:50', 'timezone'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'is_free' => ['sometimes', 'boolean'],
            'visibility' => ['sometimes', 'string', Rule::in(EventVisibility::values())],
            'banner_url' => ['nullable', 'string', 'url', 'max:500'],
            'settings' => ['sometimes', 'array'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'start_at.after' => 'The event start time must be in the future.',
            'end_at.after' => 'The event end time must be after the start time.',
        ];
    }
}
