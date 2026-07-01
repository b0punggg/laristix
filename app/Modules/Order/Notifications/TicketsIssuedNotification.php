<?php

namespace App\Modules\Order\Notifications;

use App\Modules\Order\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class TicketsIssuedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly Order $order,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->order->loadMissing(['event', 'registrations.ticket', 'items']);

        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:3000'), '/');
        $myTicketsUrl = $frontendUrl.'/my/tickets';
        $orderUrl = $frontendUrl.'/checkout/'.$this->order->uuid.'/finish';

        $mail = (new MailMessage)
            ->subject('Tiket Anda untuk '.($this->order->event?->title ?? 'Event'))
            ->greeting('Halo '.$this->order->buyer_name.',')
            ->line('Pembayaran Anda telah dikonfirmasi. Berikut detail tiket Anda:')
            ->line('**No. pesanan:** '.$this->order->order_number)
            ->line('**Event:** '.($this->order->event?->title ?? '-'));

        foreach ($this->order->registrations as $registration) {
            $ticketCode = $registration->ticket?->ticket_code ?? '-';
            $ticketName = $this->order->items
                ->firstWhere('ticket_type_id', $registration->ticket_type_id)
                ?->ticket_type_name ?? 'Tiket';

            $mail->line('- '.$ticketName.' → **'.$ticketCode.'**');
        }

        return $mail
            ->action('Lihat Tiket Saya', $myTicketsUrl)
            ->line('Atau buka detail pesanan: '.$orderUrl)
            ->line('Simpan kode tiket ini dan tunjukkan saat check-in.');
    }
}
