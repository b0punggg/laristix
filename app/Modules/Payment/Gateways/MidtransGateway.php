<?php

namespace App\Modules\Payment\Gateways;

use App\Modules\Payment\Contracts\PaymentGatewayInterface;
use App\Modules\Payment\Exceptions\PaymentException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class MidtransGateway implements PaymentGatewayInterface
{
    public function createSnapTransaction(array $payload): array
    {
        $serverKey = config('payment_module.midtrans.server_key');

        if ($serverKey === '') {
            throw PaymentException::make('Midtrans server key is not configured.');
        }

        try {
            $response = Http::timeout(30)
                ->withBasicAuth($serverKey, '')
                ->acceptJson()
                ->post(config('payment_module.midtrans.snap_url'), $payload);
        } catch (ConnectionException) {
            throw PaymentException::make(
                'Cannot reach Midtrans. Check your internet connection and MIDTRANS_IS_PRODUCTION setting.'
            );
        }

        if (! $response->successful()) {
            throw PaymentException::make(
                $this->formatMidtransError('Failed to create Midtrans Snap transaction', $response->body())
            );
        }

        /** @var array<string, mixed> $data */
        $data = $response->json();

        return $data;
    }

    public function getTransactionStatus(string $orderId): array
    {
        $serverKey = config('payment_module.midtrans.server_key');
        $baseUrl = rtrim(config('payment_module.midtrans.api_url'), '/');

        try {
            $response = Http::timeout(30)
                ->withBasicAuth($serverKey, '')
                ->acceptJson()
                ->get("{$baseUrl}/v2/{$orderId}/status");
        } catch (ConnectionException) {
            throw PaymentException::make(
                'Cannot reach Midtrans. Check your internet connection and MIDTRANS_IS_PRODUCTION setting.'
            );
        }

        if ($response->status() === 404) {
            throw PaymentException::make('Midtrans transaction not found.', 404);
        }

        if (! $response->successful()) {
            throw PaymentException::make(
                $this->formatMidtransError('Failed to fetch Midtrans transaction status', $response->body()),
                $response->status()
            );
        }

        /** @var array<string, mixed> $data */
        $data = $response->json();

        return $data;
    }

    public function verifyNotificationSignature(
        string $orderId,
        string $statusCode,
        string $grossAmount,
        string $signatureKey
    ): bool {
        $serverKey = config('payment_module.midtrans.server_key');

        if ($serverKey === '') {
            return false;
        }

        $expected = hash('sha512', $orderId.$statusCode.$grossAmount.$serverKey);

        return hash_equals($expected, $signatureKey);
    }

    private function formatMidtransError(string $prefix, string $body): string
    {
        $decoded = json_decode($body, true);

        if (is_array($decoded) && ! empty($decoded['error_messages']) && is_array($decoded['error_messages'])) {
            $messages = array_values(array_filter($decoded['error_messages'], 'is_string'));

            if ($messages !== []) {
                return $prefix.': '.implode(' ', $messages);
            }
        }

        return $prefix.': '.$body;
    }
}
