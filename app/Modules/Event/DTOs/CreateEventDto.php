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

    /** @var string|null */
    public $bannerUrl;

    /** @var array<string, mixed>|null */
    public $settings;

    /** @var list<int>|null */
    public $categoryIds;

    /** @var list<int>|null */
    public $tagIds;

    /**
     * @param  array<string, mixed>|null  $settings
     * @param  list<int>|null  $categoryIds
     * @param  list<int>|null  $tagIds
     */
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
        string $visibility = 'public',
        ?string $bannerUrl = null,
        ?array $settings = null,
        ?array $categoryIds = null,
        ?array $tagIds = null
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
        $this->bannerUrl = $bannerUrl;
        $this->settings = $settings;
        $this->categoryIds = $categoryIds;
        $this->tagIds = $tagIds;
    }
}
