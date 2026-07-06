<?php

namespace App\Modules\Organizer\Notifications;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrganizerMemberInvitationNotification extends Notification
{
    public function __construct(
        private readonly Organizer $organizer,
        private readonly User $inviter,
        private readonly string $role,
    ) {}

    /**
     * @param  mixed  $notifiable
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        return ['mail'];
    }

    /**
     * @param  mixed  $notifiable
     */
    public function toMail($notifiable): MailMessage
    {
        $frontendBase = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $loginUrl = $frontendBase.'/login?redirect='.urlencode('/select-organizer');

        return (new MailMessage)
            ->subject('Undangan bergabung ke '.$this->organizer->name)
            ->greeting('Halo '.$notifiable->name.'!')
            ->line($this->inviter->name.' mengundang Anda bergabung sebagai '.$this->roleLabel().' di organizer '.$this->organizer->name.'.')
            ->line('Masuk ke akun Laristix Anda lalu terima undangan di halaman pilih organizer.')
            ->action('Masuk & terima undangan', $loginUrl)
            ->line('Jika Anda tidak mengenal undangan ini, abaikan email ini.');
    }

    private function roleLabel(): string
    {
        return match ($this->role) {
            'admin' => 'admin',
            'staff' => 'staf',
            'scanner' => 'scanner',
            default => $this->role,
        };
    }
}
