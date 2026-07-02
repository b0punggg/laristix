<?php

namespace App\Modules\Admin\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePlatformSettingRequest extends FormRequest
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
        $key = (string) $this->route('key');

        return match ($key) {
            'maintenance_mode' => [
                'value' => ['required', 'array'],
                'value.enabled' => ['required', 'boolean'],
                'value.message' => ['required', 'string', 'max:500'],
            ],
            'default_platform_fee' => [
                'value' => ['required', 'array'],
                'value.fee_type' => ['required', 'string', Rule::in(['percentage', 'flat', 'both'])],
                'value.percentage_rate' => ['required', 'numeric', 'min:0', 'max:100'],
                'value.flat_amount' => ['required', 'numeric', 'min:0'],
                'value.fee_bearer' => ['required', 'string', Rule::in(['attendee', 'organizer'])],
            ],
            default => [
                'value' => ['prohibited'],
            ],
        };
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'value.prohibited' => 'Unknown platform setting key.',
        ];
    }
}
