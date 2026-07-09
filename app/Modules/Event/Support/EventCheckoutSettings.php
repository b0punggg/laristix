<?php

namespace App\Modules\Event\Support;

final class EventCheckoutSettings
{
    /** @var array<string, array{enabled: bool, required: bool}> */
    public const DEFAULT_BUYER_FIELDS = [
        'name' => ['enabled' => true, 'required' => true],
        'email' => ['enabled' => true, 'required' => true],
        'phone' => ['enabled' => true, 'required' => false],
        'id_number' => ['enabled' => false, 'required' => false],
        'date_of_birth' => ['enabled' => false, 'required' => false],
        'gender' => ['enabled' => false, 'required' => false],
    ];

    /**
     * @param  array<string, array{enabled: bool, required: bool}>  $buyerFields
     */
    public function __construct(
        public readonly ?int $maxTicketsPerTransaction,
        public readonly bool $oneEmailPerTransaction,
        public readonly bool $oneAttendeePerTicket,
        public readonly ?string $feeBearer,
        public readonly array $buyerFields,
    ) {}

    /**
     * @param  array<string, mixed>|null  $settings
     */
    public static function fromEventSettings(?array $settings): self
    {
        $checkout = is_array($settings['checkout'] ?? null) ? $settings['checkout'] : [];
        $rawFields = is_array($checkout['buyer_fields'] ?? null) ? $checkout['buyer_fields'] : [];

        $buyerFields = self::DEFAULT_BUYER_FIELDS;

        foreach ($buyerFields as $key => $defaults) {
            $field = is_array($rawFields[$key] ?? null) ? $rawFields[$key] : [];
            $enabled = array_key_exists('enabled', $field)
                ? (bool) $field['enabled']
                : $defaults['enabled'];
            $required = array_key_exists('required', $field)
                ? (bool) $field['required']
                : $defaults['required'];

            if ($key === 'name' || $key === 'email') {
                $enabled = true;
                $required = true;
            }

            $buyerFields[$key] = [
                'enabled' => $enabled,
                'required' => $required && $enabled,
            ];
        }

        $feeBearer = $checkout['fee_bearer'] ?? null;

        if (! in_array($feeBearer, ['attendee', 'organizer'], true)) {
            $feeBearer = null;
        }

        $maxTickets = $checkout['max_tickets_per_transaction'] ?? null;

        return new self(
            maxTicketsPerTransaction: is_numeric($maxTickets) ? max(1, (int) $maxTickets) : null,
            oneEmailPerTransaction: (bool) ($checkout['one_email_per_transaction'] ?? false),
            oneAttendeePerTicket: (bool) ($checkout['one_attendee_per_ticket'] ?? false),
            feeBearer: $feeBearer,
            buyerFields: $buyerFields,
        );
    }

    public function effectiveMaxPerOrder(int $ticketMaxPerOrder): int
    {
        if ($this->maxTicketsPerTransaction === null) {
            return $ticketMaxPerOrder;
        }

        return min($ticketMaxPerOrder, $this->maxTicketsPerTransaction);
    }
}
