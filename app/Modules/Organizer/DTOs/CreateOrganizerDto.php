<?php

namespace App\Modules\Organizer\DTOs;

class CreateOrganizerDto
{
    /** @var string */
    public $name;

    /** @var string|null */
    public $slug;

    /** @var string */
    public $email;

    /** @var string|null */
    public $phone;

    /** @var string|null */
    public $description;

    /** @var string|null */
    public $website;

    /** @var string|null */
    public $countryCode;

    /** @var string|null */
    public $currency;

    /** @var string|null */
    public $timezone;

    public function __construct(
        string $name,
        string $email,
        ?string $slug = null,
        ?string $phone = null,
        ?string $description = null,
        ?string $website = null,
        ?string $countryCode = null,
        ?string $currency = null,
        ?string $timezone = null
    ) {
        $this->name = $name;
        $this->email = $email;
        $this->slug = $slug;
        $this->phone = $phone;
        $this->description = $description;
        $this->website = $website;
        $this->countryCode = $countryCode;
        $this->currency = $currency;
        $this->timezone = $timezone;
    }
}
