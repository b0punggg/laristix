<?php

namespace App\Modules\Notification\Models;

use App\Core\Support\Traits\HasUuid;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationJob extends Model
{
    use HasUuid;

    protected $fillable = [
        'uuid',
        'organizer_id',
        'notification_template_id',
        'notification_log_id',
        'channel',
        'recipient',
        'notifiable_type',
        'notifiable_id',
        'payload',
        'status',
        'attempts',
        'max_attempts',
        'scheduled_at',
        'sent_at',
        'failed_at',
        'error_message',
        'provider_response',
        'correlation_id',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'provider_response' => 'array',
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
            'failed_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function template(): BelongsTo
    {
        return $this->belongsTo(NotificationTemplate::class, 'notification_template_id');
    }

    public function notificationLog(): BelongsTo
    {
        return $this->belongsTo(NotificationLog::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
