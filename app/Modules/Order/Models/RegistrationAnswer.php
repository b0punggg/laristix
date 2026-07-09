<?php

namespace App\Modules\Order\Models;

use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistrationAnswer extends Model
{
    protected $table = 'registration_answers';

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

    protected $casts = [
        'value_json' => 'array',
    ];

    public function registration(): BelongsTo
    {
        return $this->belongsTo(Registration::class);
    }

    public function field(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'form_field_id');
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
