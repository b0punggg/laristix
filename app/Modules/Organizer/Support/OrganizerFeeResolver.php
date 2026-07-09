<?php

namespace App\Modules\Organizer\Support;

use App\Modules\Admin\Contracts\PlatformSettingServiceInterface;
use App\Modules\Organizer\Models\OrganizerFeeConfig;

final class OrganizerFeeResolver
{
    public function __construct(
        private readonly PlatformSettingServiceInterface $platformSettings,
    ) {}

    /**
     * @return array{
     *   percentage_rate: float,
     *   flat_amount: float,
     *   fee_bearer: string,
     *   source: string
     * }
     */
    public function resolveForOrganizer(int $organizerId): array
    {
        $config = OrganizerFeeConfig::query()
            ->where('organizer_id', $organizerId)
            ->where('effective_from', '<=', now())
            ->where(function ($query) {
                $query->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', now());
            })
            ->orderByDesc('effective_from')
            ->first();

        if ($config !== null) {
            return [
                'percentage_rate' => (float) $config->percentage_rate,
                'flat_amount' => (float) $config->flat_amount,
                'fee_bearer' => (string) $config->fee_bearer,
                'source' => 'organizer',
            ];
        }

        $default = $this->platformSettings->getValue('default_platform_fee');

        if ($default !== null) {
            return [
                'percentage_rate' => (float) ($default['percentage_rate'] ?? 0),
                'flat_amount' => (float) ($default['flat_amount'] ?? 0),
                'fee_bearer' => (string) ($default['fee_bearer'] ?? 'attendee'),
                'source' => 'platform',
            ];
        }

        return [
            'percentage_rate' => 0,
            'flat_amount' => 0,
            'fee_bearer' => 'attendee',
            'source' => 'none',
        ];
    }

    /**
     * @return array{
     *   subtotal: float,
     *   platform_fee_total: float,
     *   fee_bearer: string,
     *   total_amount: float,
     *   organizer_net_amount: float
     * }
     */
    public function simulate(float $subtotal, float $percentageRate, float $flatAmount, string $feeBearer): array
    {
        $feeTotal = round($subtotal * $percentageRate / 100 + $flatAmount, 2);
        $totalAmount = $feeBearer === 'attendee' ? $subtotal + $feeTotal : $subtotal;
        $organizerNet = $feeBearer === 'organizer' ? $subtotal - $feeTotal : $subtotal;

        return [
            'subtotal' => $subtotal,
            'platform_fee_total' => $feeTotal,
            'fee_bearer' => $feeBearer,
            'total_amount' => max(0, $totalAmount),
            'organizer_net_amount' => max(0, $organizerNet),
        ];
    }
}
