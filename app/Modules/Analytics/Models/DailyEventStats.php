<?php

namespace App\Modules\Analytics\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Modules\Event\Models\Event;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyEventStats extends Model
{
    use HasOrganizer;

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

    protected function casts(): array
    {
        return [
            'stat_date' => 'date',
            'revenue_gross' => 'decimal:2',
            'revenue_net' => 'decimal:2',
            'platform_fees' => 'decimal:2',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }
}
