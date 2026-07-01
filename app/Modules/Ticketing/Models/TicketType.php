<?php

namespace App\Modules\Ticketing\Models;

use App\Core\Support\Traits\HasOrganizer;
use App\Core\Tenancy\Contracts\TenantAware;
use App\Modules\Event\Models\Event;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TicketType extends Model implements TenantAware
{
    use HasOrganizer;
    use SoftDeletes;

    protected $fillable = [
        'event_id',
        'organizer_id',
        'name',
        'kind',
        'description',
        'price',
        'currency',
        'quantity',
        'sold_count',
        'reserved_count',
        'min_per_order',
        'max_per_order',
        'sales_start_at',
        'sales_end_at',
        'visibility',
        'sort_order',
        'status',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'quantity' => 'integer',
        'sold_count' => 'integer',
        'reserved_count' => 'integer',
        'min_per_order' => 'integer',
        'max_per_order' => 'integer',
        'sort_order' => 'integer',
        'sales_start_at' => 'datetime',
        'sales_end_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function availableQuantity(): int
    {
        return max(0, $this->quantity - $this->sold_count - $this->reserved_count);
    }

    public function isFree(): bool
    {
        return $this->kind === 'free' || (float) $this->price === 0.0;
    }

    public function isSoldOut(): bool
    {
        return $this->status === 'sold_out' || $this->availableQuantity() <= 0;
    }

    public function isSalesOpen(?\DateTimeInterface $at = null): bool
    {
        $timezone = $this->resolveSalesTimezone();
        $at = Carbon::parse($at ?? now($timezone))->timezone($timezone);

        if ($this->sales_start_at !== null) {
            $salesStart = $this->sales_start_at->copy()->timezone($timezone);

            if ($at->lt($salesStart)) {
                return false;
            }
        }

        if ($this->sales_end_at !== null) {
            $salesEnd = $this->sales_end_at->copy()->timezone($timezone);

            if ($at->gt($salesEnd)) {
                return false;
            }
        }

        return true;
    }

    private function resolveSalesTimezone(): string
    {
        if ($this->relationLoaded('event') && $this->event?->timezone) {
            return $this->event->timezone;
        }

        return (string) config('app.timezone', 'Asia/Jakarta');
    }

    public function isPurchasable(): bool
    {
        return $this->status === 'active'
            && $this->visibility === 'public'
            && ! $this->isSoldOut()
            && $this->isSalesOpen();
    }

    public function canEdit(): bool
    {
        return ! in_array($this->status, ['archived'], true);
    }

    public function canDelete(): bool
    {
        return $this->sold_count === 0 && $this->reserved_count === 0;
    }
}
