<?php

namespace Tests\Unit\Core\Tenancy;

use App\Core\Tenancy\Contracts\OrganizerContextInterface;
use App\Core\Tenancy\Scopes\OrganizerScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class OrganizerScopeTest extends TestCase
{
    #[Test]
    public function it_filters_by_organizer_when_context_is_set(): void
    {
        $context = $this->createMock(OrganizerContextInterface::class);
        $context->method('getOrganizerId')->willReturn(42);

        $scope = new OrganizerScope($context);

        $builder = $this->createMock(Builder::class);
        $model = new class extends Model
        {
            protected $table = 'events';
        };

        $builder->expects($this->once())
            ->method('where')
            ->with('events.organizer_id', 42)
            ->willReturnSelf();

        $scope->apply($builder, $model);
    }

    #[Test]
    public function it_does_not_filter_when_context_is_empty(): void
    {
        $context = $this->createMock(OrganizerContextInterface::class);
        $context->method('getOrganizerId')->willReturn(null);

        $scope = new OrganizerScope($context);

        $builder = $this->createMock(Builder::class);
        $model = new class extends Model
        {
            protected $table = 'events';
        };

        $builder->expects($this->never())->method('where');

        $scope->apply($builder, $model);
    }
}
