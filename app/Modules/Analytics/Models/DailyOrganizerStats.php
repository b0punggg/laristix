<?php

namespace App\Modules\Analytics\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyOrganizerStats extends Model
{
    use HasOrganizer;

    protected $fillable = [
        'organizer_id',
        'stat_date',
        'events_active',
        'orders_count',
        'registrations_count',
        'revenue_gross',
        'platform_fees',
    ];

    protected function casts(): array
    {
        return [
            'stat_date' => 'date',
            'revenue_gross' => 'decimal:2',
            'platform_fees' => 'decimal:2',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
