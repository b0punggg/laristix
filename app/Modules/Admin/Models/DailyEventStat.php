<?php

namespace App\Modules\Admin\Models;

use App\Modules\Event\Models\Event;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyEventStat extends Model
{
    protected $fillable = [
        'event_id',
        'organizer_id',
        'stat_date',
        'orders_count',
        'registrations_count',
        'revenue_gross',
        'revenue_net',
        'platform_fees',
        'check_ins_count',
    ];

    protected $casts = [
        'stat_date' => 'date',
        'orders_count' => 'integer',
        'registrations_count' => 'integer',
        'revenue_gross' => 'decimal:2',
        'revenue_net' => 'decimal:2',
        'platform_fees' => 'decimal:2',
        'check_ins_count' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }
}
