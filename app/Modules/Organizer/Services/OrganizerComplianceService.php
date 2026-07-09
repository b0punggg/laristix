<?php

namespace App\Modules\Organizer\Services;

use App\Modules\Auth\Models\User;
use App\Modules\Organizer\Exceptions\OrganizerAccessDeniedException;
use App\Modules\Organizer\Models\Organizer;
use App\Modules\Organizer\Repositories\Contracts\OrganizerRepositoryInterface;
use Illuminate\Support\Arr;

class OrganizerComplianceService
{
    public function __construct(
        private readonly OrganizerRepositoryInterface $organizers,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function getProfile(Organizer $organizer): array
    {
        $settings = $organizer->settings ?? [];
        $compliance = Arr::get($settings, 'compliance', []);

        return [
            'type' => $compliance['type'] ?? null,
            'ktp_number' => $compliance['ktp_number'] ?? null,
            'npwp_number' => $compliance['npwp_number'] ?? null,
            'legal_name' => $compliance['legal_name'] ?? null,
            'status' => $compliance['status'] ?? 'not_submitted',
            'rejection_reason' => $compliance['rejection_reason'] ?? null,
            'submitted_at' => $compliance['submitted_at'] ?? null,
            'verified_at' => $compliance['verified_at'] ?? null,
        ];
    }

    public function isVerified(Organizer $organizer): bool
    {
        return $this->getProfile($organizer)['status'] === 'verified';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function submit(Organizer $organizer, User $user, array $payload): Organizer
    {
        $this->assertCanManage($organizer, $user);

        $type = (string) ($payload['type'] ?? 'individual');
        $compliance = [
            'type' => $type,
            'legal_name' => trim((string) ($payload['legal_name'] ?? '')),
            'ktp_number' => trim((string) ($payload['ktp_number'] ?? '')),
            'npwp_number' => trim((string) ($payload['npwp_number'] ?? '')),
            'status' => 'pending',
            'submitted_at' => now()->toIso8601String(),
            'verified_at' => null,
            'rejection_reason' => null,
        ];

        if ($type === 'individual' && $compliance['ktp_number'] === '') {
            throw OrganizerAccessDeniedException::make('Nomor KTP wajib diisi untuk tipe individual.');
        }

        if ($type === 'business' && $compliance['npwp_number'] === '') {
            throw OrganizerAccessDeniedException::make('Nomor NPWP wajib diisi untuk tipe bisnis.');
        }

        $settings = $organizer->settings ?? [];
        $settings['compliance'] = $compliance;

        return $this->organizers->update($organizer, ['settings' => $settings]);
    }

    public function verify(Organizer $organizer, User $admin): Organizer
    {
        if (! $admin->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make();
        }

        $settings = $organizer->settings ?? [];
        $compliance = Arr::get($settings, 'compliance', []);

        if (($compliance['status'] ?? 'not_submitted') !== 'pending') {
            throw OrganizerAccessDeniedException::make('Compliance is not pending review.');
        }

        $compliance['status'] = 'verified';
        $compliance['verified_at'] = now()->toIso8601String();
        $compliance['rejection_reason'] = null;
        $settings['compliance'] = $compliance;

        return $this->organizers->update($organizer, ['settings' => $settings]);
    }

    public function reject(Organizer $organizer, User $admin, ?string $reason): Organizer
    {
        if (! $admin->isSuperAdmin()) {
            throw OrganizerAccessDeniedException::make();
        }

        $settings = $organizer->settings ?? [];
        $compliance = Arr::get($settings, 'compliance', []);

        if (($compliance['status'] ?? 'not_submitted') !== 'pending') {
            throw OrganizerAccessDeniedException::make('Compliance is not pending review.');
        }

        $compliance['status'] = 'rejected';
        $compliance['rejection_reason'] = $reason;
        $settings['compliance'] = $compliance;

        return $this->organizers->update($organizer, ['settings' => $settings]);
    }

    private function assertCanManage(Organizer $organizer, User $user): void
    {
        if ($user->isSuperAdmin()) {
            return;
        }

        $membership = $organizer->activeMembers()->where('user_id', $user->id)->first();

        if ($membership === null || ! in_array($membership->role, ['owner', 'admin'], true)) {
            throw OrganizerAccessDeniedException::make();
        }
    }
}
