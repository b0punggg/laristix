<?php

namespace App\Modules\Event\DTOs;

class CreateVenueDto
{
    /** @var string */
    public $name;

    /** @var string */
    public $type;

    /** @var string|null */
    public $address;

    /** @var string|null */
    public $city;

    /** @var string|null */
    public $province;

    /** @var string|null */
    public $countryCode;

    /** @var string|null */
    public $postalCode;

    /** @var float|null */
    public $latitude;

    /** @var float|null */
    public $longitude;

    /** @var string|null */
    public $onlineUrl;

    /** @var int|null */
    public $capacity;

    public function __construct(
        string $name,
        string $type = 'physical',
        ?string $address = null,
        ?string $city = null,
        ?string $province = null,
        ?string $countryCode = null,
        ?string $postalCode = null,
        ?float $latitude = null,
        ?float $longitude = null,
        ?string $onlineUrl = null,
        ?int $capacity = null
    ) {
        $this->name = $name;
        $this->type = $type;
        $this->address = $address;
        $this->city = $city;
        $this->province = $province;
        $this->countryCode = $countryCode;
        $this->postalCode = $postalCode;
        $this->latitude = $latitude;
        $this->longitude = $longitude;
        $this->onlineUrl = $onlineUrl;
        $this->capacity = $capacity;
    }
}
