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
            'venue_id' => ['nullable', 'integer', 'exists:venues,id'],
            'category_id' => ['nullable', 'integer', 'exists:event_categories,id'],
            'start_at' => ['required', 'date', 'after:now'],
            'end_at' => ['required', 'date', 'after:start_at'],
            'timezone' => ['required', 'string', 'max:50', 'timezone'],
            'capacity' => ['nullable', 'integer', 'min:1'],
            'is_free' => ['sometimes', 'boolean'],
            'visibility' => ['sometimes', 'string', Rule::in(EventVisibility::values())],
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
