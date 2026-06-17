<?php

namespace App\Modules\Form\Models;

use App\Core\Support\Traits\HasOrganizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FormFieldOption extends Model
{
    use HasOrganizer;

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
}
