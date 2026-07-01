<?php

namespace App\Core\Tenancy\Contracts;

interface TenantAware
{
  /**
   * @return int|null
   */
    public function getOrganizerId();
}
