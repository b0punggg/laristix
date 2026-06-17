<?php

namespace App\Modules\Form\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Participant\Models\RegistrationAnswer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FormField extends Model
{
    use HasOrganizer;
    use SoftDeletes;

    protected $fillable = [
        'form_id',
        'organizer_id',
        'label',
        'name',
        'type',
        'placeholder',
        'help_text',
        'is_required',
        'is_unique_per_event',
        'validation_rules',
        'default_value',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'is_unique_per_event' => 'boolean',
            'validation_rules' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function form(): BelongsTo
    {
        return $this->belongsTo(RegistrationForm::class, 'form_id');
    }

    public function options(): HasMany
    {
        return $this->hasMany(FormFieldOption::class, 'field_id');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(RegistrationAnswer::class);
    }
}
