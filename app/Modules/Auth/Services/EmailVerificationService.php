<?php

namespace App\Modules\Auth\Services;

use App\Modules\Auth\Contracts\EmailVerificationServiceInterface;
use App\Modules\Auth\Models\User;
use App\Modules\Auth\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\URL;

class EmailVerificationService implements EmailVerificationServiceInterface
{
    public function sendVerificationNotification(User $user): void
    {
        if ($user->hasVerifiedEmail()) {
            return;
        }

        $user->notify(new VerifyEmailNotification);
    }

    public function markVerified(User $user, int $id, string $hash): void
    {
        if (! hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            abort(403, 'Invalid verification link.');
        }

        if ($user->id !== $id) {
            abort(403, 'Invalid verification link.');
        }

        if (! URL::hasValidSignature(request())) {
            abort(403, 'Verification link has expired.');
        }

        if ($user->hasVerifiedEmail()) {
            return;
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }
    }
}
