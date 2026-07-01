<?php

namespace App\Modules\Ticketing\Http\Requests;

use App\Modules\Ticketing\Enums\TicketTypeStatus;
use App\Modules\Ticketing\Enums\TicketVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTicketTypeRequest extends FormRequest
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
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['sometimes', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'quantity' => ['sometimes', 'integer', 'min:1'],
            'min_per_order' => ['sometimes', 'integer', 'min:1'],
            'max_per_order' => ['sometimes', 'integer', 'min:1'],
            'sales_start_at' => ['nullable', 'date'],
            'sales_end_at' => ['nullable', 'date', 'after:sales_start_at'],
            'visibility' => ['sometimes', 'string', Rule::in(TicketVisibility::values())],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
            'status' => ['sometimes', 'string', Rule::in(TicketTypeStatus::values())],
        ];
    }
}
