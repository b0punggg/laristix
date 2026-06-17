<?php

namespace App\Modules\Notification\Models;

use App\Modules\Organizer\Models\Organizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class NotificationLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'organizer_id',
        'recipient_email',
        'channel',
        'template',
        'notifiable_type',
        'notifiable_id',
        'status',
        'payload',
        'error_message',
        'sent_at',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'sent_at' => 'datetime',
            'created_at' => 'datetime',
        ];
    }

    public function organizer(): BelongsTo
    {
        return $this->belongsTo(Organizer::class);
    }

    public function notifiable(): MorphTo
    {
        return $this->morphTo();
    }
}
