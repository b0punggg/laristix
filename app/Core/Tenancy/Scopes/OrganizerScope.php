<?php

namespace App\Core\Tenancy\Scopes;

use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class OrganizerScope implements Scope
{
    public function __construct(
        private readonly OrganizerContextInterface $context,
    ) {}

    public function apply(Builder $builder, Model $model): void
    {
        if (! config('tenancy.scope_enabled', true)) {
            return;
        }

        $organizerId = $this->context->getOrganizerId();

        if ($organizerId !== null) {
            $builder->where($model->getTable().'.organizer_id', $organizerId);
        }
    }
}
