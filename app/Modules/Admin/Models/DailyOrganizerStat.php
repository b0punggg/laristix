<?php

namespace App\Modules\Admin\Models;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyOrganizerStat extends Model
{
    protected $fillable = [
        'organizer_id',
        'stat_date',
        'events_active',
        'orders_count',
        'registrations_count',
        'revenue_gross',
        'platform_fees',
    ];

    protected $casts = [
        'stat_date' => 'date',
        'events_active' => 'integer',
        'orders_count' => 'integer',
        'registrations_count' => 'integer',
        'revenue_gross' => 'decimal:2',
        'platform_fees' => 'decimal:2',
    ];

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
