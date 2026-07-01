<?php

namespace App\Core\Support\Traits;

use App\Core\Tenancy\Scopes\OrganizerScope;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait HasOrganizer
{
    public static function bootHasOrganizer(): void
    {
        static::addGlobalScope(app(OrganizerScope::class));
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function getOrganizerId(): ?int
    {
        return $this->organizer_id;
    }

    public static function withoutOrganizerScope(): Builder
    {
        return static::withoutGlobalScope(OrganizerScope::class);
    }

    public static function forOrganizer(int $organizerId): Builder
    {
        return static::withoutOrganizerScope()->where('organizer_id', $organizerId);
    }
}
