<?php

namespace App\Modules\Participant\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Event\Models\Event;
use App\Modules\Form\Models\FormField;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationAnswer extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'registration_id',
        'form_field_id',
        'organizer_id',
        'event_id',
        'field_name',
        'field_label',
        'value_text',
        'value_json',
    ];

    protected function casts(): array
    {
        return [
            'value_json' => 'array',
        ];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function formField(): BelongsTo
    {
        return $this->belongsTo(FormField::class);
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
