<?php

namespace App\Modules\Ticketing\DTOs;

class UpdateTicketTypeDto
{
    /** @var string|null */
    public $name;

    /** @var string|null */
    public $description;

    /** @var float|null */
    public $price;

    /** @var string|null */
    public $currency;

    /** @var int|null */
    public $quantity;

    /** @var int|null */
    public $minPerOrder;

    /** @var int|null */
    public $maxPerOrder;

    /** @var string|null */
    public $salesStartAt;

    /** @var string|null */
    public $salesEndAt;

    /** @var string|null */
    public $visibility;

    /** @var int|null */
    public $sortOrder;

    /** @var string|null */
    public $status;

    public function __construct(
        ?string $name = null,
        ?string $description = null,
        ?float $price = null,
        ?string $currency = null,
        ?int $quantity = null,
        ?int $minPerOrder = null,
        ?int $maxPerOrder = null,
        ?string $salesStartAt = null,
        ?string $salesEndAt = null,
        ?string $visibility = null,
        ?int $sortOrder = null,
        ?string $status = null
    ) {
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->currency = $currency;
        $this->quantity = $quantity;
        $this->minPerOrder = $minPerOrder;
        $this->maxPerOrder = $maxPerOrder;
        $this->salesStartAt = $salesStartAt;
        $this->salesEndAt = $salesEndAt;
        $this->visibility = $visibility;
        $this->sortOrder = $sortOrder;
        $this->status = $status;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'description' => $this->description,
            'price' => $this->price,
            'currency' => $this->currency,
            'quantity' => $this->quantity,
            'min_per_order' => $this->minPerOrder,
            'max_per_order' => $this->maxPerOrder,
            'sales_start_at' => $this->salesStartAt,
            'sales_end_at' => $this->salesEndAt,
            'visibility' => $this->visibility,
            'sort_order' => $this->sortOrder,
            'status' => $this->status,
        ], fn ($value) => $value !== null);
    }
}
