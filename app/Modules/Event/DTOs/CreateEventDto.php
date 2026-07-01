<?php

namespace App\Modules\Event\DTOs;

class CreateEventDto
{
    /** @var string */
    public $title;

    /** @var string|null */
    public $slug;

    /** @var string|null */
    public $description;

    /** @var string|null */
    public $shortDescription;

    /** @var int|null */
    public $venueId;

    /** @var int|null */
    public $categoryId;

    /** @var string */
    public $startAt;

    /** @var string */
    public $endAt;

    /** @var string */
    public $timezone;

    /** @var int|null */
    public $capacity;

    /** @var bool */
    public $isFree;

    /** @var string */
    public $visibility;

    public function __construct(
        string $title,
        string $startAt,
        string $endAt,
        string $timezone,
        ?string $slug = null,
        ?string $description = null,
        ?string $shortDescription = null,
        ?int $venueId = null,
        ?int $categoryId = null,
        ?int $capacity = null,
        bool $isFree = false,
        string $visibility = 'public'
    ) {
        $this->title = $title;
        $this->startAt = $startAt;
        $this->endAt = $endAt;
        $this->timezone = $timezone;
        $this->slug = $slug;
        $this->description = $description;
        $this->shortDescription = $shortDescription;
        $this->venueId = $venueId;
        $this->categoryId = $categoryId;
        $this->capacity = $capacity;
        $this->isFree = $isFree;
        $this->visibility = $visibility;
    }
}
