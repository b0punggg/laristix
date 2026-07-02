<?php

namespace App\Modules\Organizer\DTOs;

class StoreOrganizerFeeConfigDto
{
    public function __construct(
        public readonly string $feeType,
        public readonly float $percentageRate,
        public readonly float $flatAmount,
        public readonly string $feeBearer,
        public readonly string $effectiveFrom,
        public readonly ?string $effectiveUntil = null,
        public readonly ?string $notes = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(int $organizerId, int $createdBy): array
    {
        return [
            'organizer_id' => $organizerId,
            'fee_type' => $this->feeType,
            'percentage_rate' => $this->percentageRate,
            'flat_amount' => $this->flatAmount,
            'fee_bearer' => $this->feeBearer,
            'effective_from' => $this->effectiveFrom,
            'effective_until' => $this->effectiveUntil,
            'created_by' => $createdBy,
            'notes' => $this->notes,
        ];
    }
}
