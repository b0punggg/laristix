<?php

namespace Tests\Feature\Auth;

use App\Modules\Auth\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationSignatureTest extends TestCase
{
    use RefreshDatabase;

    public function test_signed_verification_url_is_valid_when_forwarded_host_matches_app_url(): void
    {
        Config::set('app.url', 'http://laristix.test');

        $user = User::factory()->unverified()->create([
            'email' => 'signed-verify@example.com',
        ]);

        $hash = sha1($user->getEmailForVerification());
        $signedUrl = URL::temporarySignedRoute(
            'api.v1.auth.verification.verify',
            now()->addHour(),
            ['id' => $user->id, 'hash' => $hash]
        );

        $parsed = parse_url($signedUrl);
        parse_str($parsed['query'] ?? '', $query);

        $response = $this->getJson($parsed['path'].'?'.http_build_query($query), [
            'X-Forwarded-Host' => 'laristix.test',
            'X-Forwarded-Proto' => 'http',
        ]);

        $response->assertOk();
        $response->assertJsonPath('message', 'Email verified successfully.');
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_signed_verification_url_works_through_proxied_localhost_host(): void
    {
        Config::set('app.url', 'http://laristix.test');

        $user = User::factory()->unverified()->create([
            'email' => 'proxy-verify@example.com',
        ]);

        $hash = sha1($user->getEmailForVerification());
        $signedUrl = URL::temporarySignedRoute(
            'api.v1.auth.verification.verify',
            now()->addHour(),
            ['id' => $user->id, 'hash' => $hash]
        );

        $parsed = parse_url($signedUrl);
        parse_str($parsed['query'] ?? '', $query);

        $response = $this->getJson($parsed['path'].'?'.http_build_query($query), [
            'X-Forwarded-Host' => 'localhost:3000',
            'X-Forwarded-Proto' => 'http',
        ]);

        $response->assertOk();
        $this->assertNotNull($user->fresh()->email_verified_at);
    }

    public function test_signed_verification_url_fails_when_signature_is_invalid(): void
    {
        Config::set('app.url', 'http://laristix.test');

        $user = User::factory()->unverified()->create([
            'email' => 'bad-host@example.com',
        ]);

        $hash = sha1($user->getEmailForVerification());
        $signedUrl = URL::temporarySignedRoute(
            'api.v1.auth.verification.verify',
            now()->addHour(),
            ['id' => $user->id, 'hash' => $hash]
        );

        $parsed = parse_url($signedUrl);
        parse_str($parsed['query'] ?? '', $query);
        $query['signature'] = 'invalid-signature';

        $response = $this->getJson($parsed['path'].'?'.http_build_query($query), [
            'X-Forwarded-Host' => 'localhost:3000',
            'X-Forwarded-Proto' => 'http',
        ]);

        $response->assertForbidden();
        $this->assertNull($user->fresh()->email_verified_at);
    }
}
