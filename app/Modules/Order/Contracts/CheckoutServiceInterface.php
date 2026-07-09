<?php

namespace App\Modules\Order\Contracts;

use App\Modules\Event\Models\Event;
use App\Modules\Order\DTOs\CreateCheckoutDto;
use App\Modules\Order\Models\Order;
use App\Modules\Ticketing\Models\TicketType;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CheckoutServiceInterface
{
    /**
     * @return array{order: Order, snap_token: string|null, client_key: string|null}
     */
    public function checkout(CreateCheckoutDto $dto): array;

    /**
     * @return array{
     *   subtotal: float,
     *   discount_amount: float,
     *   promo_code: string|null,
     *   promo_description: string|null,
     *   platform_fee_pct_rate: float,
     *   platform_fee_flat: float,
     *   platform_fee_total: float,
     *   fee_bearer: string,
     *   total_amount: float,
     *   organizer_net_amount: float
     * }
     */
    public function quote(Event $event, TicketType $ticketType, int $quantity, ?string $promoCode = null): array;

    public function showPublic(string $uuid): Order;

    public function showForUser(string $uuid, int $userId): Order;

    public function listForUser(int $userId, int $perPage = 15): LengthAwarePaginator;
}
