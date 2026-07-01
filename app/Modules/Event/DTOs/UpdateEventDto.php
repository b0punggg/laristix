<?php

namespace App\Modules\Event\DTOs;

class UpdateEventDto
{
    /** @var string|null */
    public $title;

    /** @var string|null */
    public $description;

    /** @var string|null */
    public $shortDescription;

    /** @var string|null */
    public $bannerUrl;

    /** @var int|null */
    public $venueId;

    /** @var int|null */
    public $categoryId;

    /** @var string|null */
    public $startAt;

    /** @var string|null */
    public $endAt;

    /** @var string|null */
    public $timezone;

    /** @var int|null */
    public $capacity;

    /** @var bool|null */
    public $isFree;

    /** @var string|null */
    public $visibility;

    /** @var array<string, mixed>|null */
    public $settings;

    /**
     * @param  array<string, mixed>|null  $settings
     */
    public function __construct(
        ?string $title = null,
        ?string $description = null,
        ?string $shortDescription = null,
        ?string $bannerUrl = null,
        ?int $venueId = null,
        ?int $categoryId = null,
        ?string $startAt = null,
        ?string $endAt = null,
        ?string $timezone = null,
        ?int $capacity = null,
        ?bool $isFree = null,
        ?string $visibility = null,
        ?array $settings = null
    ) {
        $this->title = $title;
        $this->description = $description;
        $this->shortDescription = $shortDescription;
        $this->bannerUrl = $bannerUrl;
        $this->venueId = $venueId;
        $this->categoryId = $categoryId;
        $this->startAt = $startAt;
        $this->endAt = $endAt;
        $this->timezone = $timezone;
        $this->capacity = $capacity;
        $this->isFree = $isFree;
        $this->visibility = $visibility;
        $this->settings = $settings;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'title' => $this->title,
            'description' => $this->description,
            'short_description' => $this->shortDescription,
            'banner_url' => $this->bannerUrl,
            'venue_id' => $this->venueId,
            'category_id' => $this->categoryId,
            'start_at' => $this->startAt,
            'end_at' => $this->endAt,
            'timezone' => $this->timezone,
            'capacity' => $this->capacity,
            'is_free' => $this->isFree,
            'visibility' => $this->visibility,
            'settings' => $this->settings,
        ], fn ($value) => $value !== null);
    }
}
