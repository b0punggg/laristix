<?php

namespace App\Modules\Organizer\DTOs;

class UpdateOrganizerDto
{
    /** @var string|null */
    public $name;

    /** @var string|null */
    public $email;

    /** @var string|null */
    public $phone;

    /** @var string|null */
    public $logoUrl;

    /** @var string|null */
    public $website;

    /** @var string|null */
    public $description;

    /** @var string|null */
    public $countryCode;

    /** @var string|null */
    public $currency;

    /** @var string|null */
    public $timezone;

    /** @var array<string, mixed>|null */
    public $settings;

    /**
     * @param  array<string, mixed>|null  $settings
     */
    public function __construct(
        ?string $name = null,
        ?string $email = null,
        ?string $phone = null,
        ?string $logoUrl = null,
        ?string $website = null,
        ?string $description = null,
        ?string $countryCode = null,
        ?string $currency = null,
        ?string $timezone = null,
        ?array $settings = null
    ) {
        $this->name = $name;
        $this->email = $email;
        $this->phone = $phone;
        $this->logoUrl = $logoUrl;
        $this->website = $website;
        $this->description = $description;
        $this->countryCode = $countryCode;
        $this->currency = $currency;
        $this->timezone = $timezone;
        $this->settings = $settings;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'logo_url' => $this->logoUrl,
            'website' => $this->website,
            'description' => $this->description,
            'country_code' => $this->countryCode,
            'currency' => $this->currency,
            'timezone' => $this->timezone,
            'settings' => $this->settings,
        ], fn ($value) => $value !== null);
    }
}
