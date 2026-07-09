<?php

namespace App\Modules\Order\Models;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FormField extends Model
{
    use SoftDeletes;

    protected $table = 'form_fields';

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

    protected $casts = [
        'is_required' => 'boolean',
        'is_unique_per_event' => 'boolean',
        'validation_rules' => 'array',
        'is_active' => 'boolean',
    ];

    public function form(): BelongsTo
    {
        return $this->belongsTo(RegistrationForm::class, 'form_id');
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function options(): HasMany
    {
        return $this->hasMany(FormFieldOption::class, 'field_id')->orderBy('sort_order');
    }
}
