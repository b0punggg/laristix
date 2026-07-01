<?php

namespace App\Modules\Organizer\Http\Requests;

use App\Modules\Organizer\Enums\OrganizerMemberRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class InviteOrganizerMemberRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255'],
            'role' => ['required', 'string', Rule::in(OrganizerMemberRole::assignable())],
        ];
    }
}
