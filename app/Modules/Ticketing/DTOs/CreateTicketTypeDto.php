<?php

namespace App\Modules\Ticketing\DTOs;

class CreateTicketTypeDto
{
    /** @var string */
    public $kind;

    /** @var string|null */
    public $name;

    /** @var string|null */
    public $description;

    /** @var float|null */
    public $price;

    /** @var string */
    public $currency;

    /** @var int */
    public $quantity;

    /** @var int */
    public $minPerOrder;

    /** @var int */
    public $maxPerOrder;

    /** @var string|null */
    public $salesStartAt;

    /** @var string|null */
    public $salesEndAt;

    /** @var string */
    public $visibility;

    /** @var int */
    public $sortOrder;

    public function __construct(
        string $kind,
        int $quantity,
        string $currency = 'IDR',
        ?string $name = null,
        ?string $description = null,
        ?float $price = null,
        int $minPerOrder = 1,
        int $maxPerOrder = 10,
        ?string $salesStartAt = null,
        ?string $salesEndAt = null,
        string $visibility = 'public',
        int $sortOrder = 0
    ) {
        $this->kind = $kind;
        $this->quantity = $quantity;
        $this->currency = $currency;
        $this->name = $name;
        $this->description = $description;
        $this->price = $price;
        $this->minPerOrder = $minPerOrder;
        $this->maxPerOrder = $maxPerOrder;
        $this->salesStartAt = $salesStartAt;
        $this->salesEndAt = $salesEndAt;
        $this->visibility = $visibility;
        $this->sortOrder = $sortOrder;
    }
}
