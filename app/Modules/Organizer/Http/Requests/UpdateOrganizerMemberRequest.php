<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Modules\Organizer\Enums\OrganizerMemberRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrganizerMemberRequest extends FormRequest
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
            'role' => ['sometimes', 'string', Rule::in(OrganizerMemberRole::values())],
            'status' => ['sometimes', 'string', Rule::in(['pending', 'active', 'removed'])],
        ];
    }
}
