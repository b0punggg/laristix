<?php

namespace App\Modules\Auth\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends Notification
{
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
        $id = $notifiable->getKey();
        $hash = sha1($notifiable->getEmailForVerification());
        $expiresAt = now()->addMinutes((int) config('auth_module.verification.expire', 60));

        $previousRootUrl = config('app.url');
        URL::forceRootUrl($previousRootUrl);

        try {
            $signedApiUrl = URL::temporarySignedRoute(
                'api.v1.auth.verification.verify',
                $expiresAt,
                compact('id', 'hash')
            );
        } finally {
            URL::forceRootUrl(config('app.url'));
        }

        $verificationUrl = $this->buildFrontendVerificationUrl($signedApiUrl);

        return (new MailMessage)
            ->subject('Verify Email Address')
            ->line('Please click the button below to verify your email address.')
            ->action('Verify Email Address', $verificationUrl)
            ->line('If you did not create an account, no further action is required.');
    }

    private function buildFrontendVerificationUrl(string $signedApiUrl): string
    {
        $parsed = parse_url($signedApiUrl);
        $path = $parsed['path'] ?? '';

        if (! preg_match('#/email/verify/(\d+)/([^/]+)$#', $path, $matches)) {
            return $signedApiUrl;
        }

        $frontendBase = rtrim((string) config('app.frontend_url', config('app.url')), '/');
        $query = $parsed['query'] ?? '';

        if ($query === '') {
            return $signedApiUrl;
        }

        return $frontendBase.'/verify-email/confirm?id='.$matches[1].'&hash='.$matches[2].'&'.$query;
    }
}
