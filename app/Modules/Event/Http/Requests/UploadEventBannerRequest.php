<?php

namespace App\Modules\Event\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadEventBannerRequest extends FormRequest
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
            'banner' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'banner.max' => 'Banner image must not exceed 2 MB.',
            'banner.mimes' => 'Banner must be a JPEG, PNG, or WebP image.',
        ];
    }
}
