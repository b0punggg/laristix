<?php

namespace App\Modules\Organizer\DTOs;

class UpdateOrganizerFeeConfigDto
{
    public function __construct(
        public readonly ?string $feeType = null,
        public readonly ?float $percentageRate = null,
        public readonly ?float $flatAmount = null,
        public readonly ?string $feeBearer = null,
        public readonly ?string $effectiveFrom = null,
        public readonly ?string $effectiveUntil = null,
        public readonly ?string $notes = null,
    ) {}

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $data = [];

        if ($this->feeType !== null) {
            $data['fee_type'] = $this->feeType;
        }

        if ($this->percentageRate !== null) {
            $data['percentage_rate'] = $this->percentageRate;
        }

        if ($this->flatAmount !== null) {
            $data['flat_amount'] = $this->flatAmount;
        }

        if ($this->feeBearer !== null) {
            $data['fee_bearer'] = $this->feeBearer;
        }

        if ($this->effectiveFrom !== null) {
            $data['effective_from'] = $this->effectiveFrom;
        }

        if ($this->effectiveUntil !== null) {
            $data['effective_until'] = $this->effectiveUntil;
        }

        if ($this->notes !== null) {
            $data['notes'] = $this->notes;
        }

        return $data;
    }
}
