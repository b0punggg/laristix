<?php

namespace App\Modules\Ticketing\Http\Requests;

use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Enums\TicketTypeStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ListTicketTypesRequest extends FormRequest
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
            'status' => ['sometimes', 'string', Rule::in(TicketTypeStatus::values())],
            'kind' => ['sometimes', 'string', Rule::in(TicketKind::values())],
        ];
    }
}
