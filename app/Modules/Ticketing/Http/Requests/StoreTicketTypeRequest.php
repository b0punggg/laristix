<?php

namespace App\Modules\Ticketing\Http\Requests;

use App\Modules\Ticketing\Enums\TicketKind;
use App\Modules\Ticketing\Enums\TicketVisibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketTypeRequest extends FormRequest
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
            'kind' => ['required', 'string', Rule::in(TicketKind::values())],
            'name' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'quantity' => ['required', 'integer', 'min:1'],
            'min_per_order' => ['sometimes', 'integer', 'min:1'],
            'max_per_order' => ['sometimes', 'integer', 'min:1'],
            'sales_start_at' => ['nullable', 'date'],
            'sales_end_at' => ['nullable', 'date', 'after:sales_start_at'],
            'visibility' => ['sometimes', 'string', Rule::in(TicketVisibility::values())],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'kind.in' => 'Ticket kind must be free, paid, or vip.',
            'sales_end_at.after' => 'Sales end must be after sales start.',
        ];
    }
}
