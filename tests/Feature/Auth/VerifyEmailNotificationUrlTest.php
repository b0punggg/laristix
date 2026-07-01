<?php

namespace Tests\Feature\Auth;

use App\Modules\Auth\Models\User;
use App\Modules\Auth\Notifications\VerifyEmailNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class VerifyEmailNotificationUrlTest extends TestCase
{
    use RefreshDatabase;

    public function test_frontend_verification_url_preserves_signed_query_string(): void
    {
        Config::set('app.url', 'http://laristix.test');
        Config::set('app.frontend_url', 'http://localhost:3000');

        Notification::fake();

        $user = User::factory()->unverified()->create([
            'email' => 'preserve-query@example.com',
        ]);

        $user->notify(new VerifyEmailNotification);

        Notification::assertSentTo($user, VerifyEmailNotification::class, function (VerifyEmailNotification $notification) use ($user) {
            $mail = $notification->toMail($user);
            $actionUrl = $mail->actionUrl;

            $signedApiUrl = URL::temporarySignedRoute(
                'api.v1.auth.verification.verify',
                now()->addHour(),
                [
                    'id' => $user->id,
                    'hash' => sha1($user->getEmailForVerification()),
                ]
            );

            $apiQuery = parse_url($signedApiUrl, PHP_URL_QUERY);

            $this->assertStringStartsWith('http://localhost:3000/verify-email/confirm?', $actionUrl);
            $this->assertStringContainsString('id='.$user->id, $actionUrl);
            $this->assertStringContainsString('hash='.sha1($user->getEmailForVerification()), $actionUrl);
            $this->assertStringContainsString($apiQuery, $actionUrl);

            return true;
        });
    }
}
