<?php

namespace App\Modules\Order\Models;

use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistrationForm extends Model
{
    protected $table = 'registration_forms';

    protected $fillable = [
        'event_id',
        'organizer_id',
        'title',
        'description',
        'settings',
        'is_active',
    ];

    protected $casts = [
        'settings' => 'array',
        'is_active' => 'boolean',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class, 'form_id')->orderBy('sort_order');
    }

    public function activeFields(): HasMany
    {
        return $this->fields()->where('is_active', true);
    }
}
