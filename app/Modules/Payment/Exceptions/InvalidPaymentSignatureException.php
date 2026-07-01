<?php

namespace App\Modules\Payment\Exceptions;

use Symfony\Component\HttpFoundation\Response;

class InvalidPaymentSignatureException extends PaymentException
{
    protected $statusCode = Response::HTTP_FORBIDDEN;

    protected $errorCode = 'INVALID_PAYMENT_SIGNATURE';

    public function __construct()
    {
        parent::__construct('Invalid payment notification signature.');
    }
}
