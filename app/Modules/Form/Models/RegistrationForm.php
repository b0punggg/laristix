<?php

namespace App\Modules\Form\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Event\Models\Event;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrationForm extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'title',
        'description',
        'settings',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'settings' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class, 'form_id');
    }
}
