<?php

namespace App\Core\Tenancy\Contracts;

interface TenantAware
{
    public function getOrganizerId(): ?int;
}
