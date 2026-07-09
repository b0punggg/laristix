<?php

namespace App\Modules\Order\Models;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormFieldOption extends Model
{
    protected $table = 'form_field_options';

    protected $fillable = [
        'field_id',
        'organizer_id',
        'label',
        'value',
        'sort_order',
    ];

    public function field(): BelongsTo
    {
        return $this->belongsTo(FormField::class, 'field_id');
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
