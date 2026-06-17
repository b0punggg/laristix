<?php

namespace Tests\Unit\Core\Tenancy;

use App\Core\Tenancy\Contracts\OrganizerMembershipValidatorInterface;
use App\Core\Tenancy\Exceptions\OrganizerAccessDeniedException;
use App\Core\Tenancy\Services\ActiveOrganizerService;
use App\Modules\Auth\Models\User;
use Illuminate\Contracts\Session\Session;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class ActiveOrganizerServiceTest extends TestCase
{
    #[Test]
    public function it_returns_session_organizer_when_membership_is_valid(): void
    {
        $session = new ArraySessionStore(['active_organizer_id' => 7]);
        $validator = $this->createMock(OrganizerMembershipValidatorInterface::class);
        $validator->method('hasActiveMembership')->willReturn(true);

        $service = new ActiveOrganizerService($session, $validator);
        $user = new User;
        $user->id = 1;

        $this->assertSame(7, $service->getActiveOrganizerId($user));
    }

    #[Test]
    public function it_rejects_header_hint_without_membership(): void
    {
        $session = new ArraySessionStore([]);
        $validator = $this->createMock(OrganizerMembershipValidatorInterface::class);
        $validator->method('hasActiveMembership')->willReturn(false);

        $service = new ActiveOrganizerService($session, $validator);
        $user = new User;
        $user->id = 1;

        $this->expectException(OrganizerAccessDeniedException::class);

        $service->resolveOrganizerId($user, 99);
    }

    #[Test]
    public function it_clears_session_on_clear(): void
    {
        $session = new ArraySessionStore(['active_organizer_id' => 5]);
        $validator = $this->createMock(OrganizerMembershipValidatorInterface::class);

        $service = new ActiveOrganizerService($session, $validator);
        $user = new User;

        $service->clear($user);

        $this->assertNull($session->get('active_organizer_id'));
    }
}

/**
 * Minimal session double for unit tests.
 */
class ArraySessionStore implements Session
{
    public function __construct(private array $data = []) {}

    public function start(): bool
    {
        return true;
    }

    public function regenerate($destroy = false): bool
    {
        return true;
    }

    public function invalidate(): bool
    {
        return true;
    }

    public function migrate($destroy = false): bool
    {
        return true;
    }

    public function isStarted(): bool
    {
        return true;
    }

    public function save(): void {}

    public function age(): int
    {
        return 0;
    }

    public function all(): array
    {
        return $this->data;
    }

    public function put($key, $value = null): void
    {
        if (is_array($key)) {
            foreach ($key as $k => $v) {
                $this->data[$k] = $v;
            }

            return;
        }

        $this->data[$key] = $value;
    }

    public function get($key, $default = null): mixed
    {
        return $this->data[$key] ?? $default;
    }

    public function pull($key, $default = null): mixed
    {
        $value = $this->get($key, $default);
        unset($this->data[$key]);

        return $value;
    }

    public function push($key, $value): void
    {
        $this->data[$key][] = $value;
    }

    public function increment($key, $amount = 1): int
    {
        $this->data[$key] = ($this->data[$key] ?? 0) + $amount;

        return $this->data[$key];
    }

    public function decrement($key, $amount = 1): int
    {
        return $this->increment($key, -$amount);
    }

    public function has($key): bool
    {
        return array_key_exists($key, $this->data);
    }

    public function missing($key): bool
    {
        return ! $this->has($key);
    }

    public function exists($key): bool
    {
        return $this->has($key);
    }

    public function forget($keys): void
    {
        foreach ((array) $keys as $key) {
            unset($this->data[$key]);
        }
    }

    public function flush(): void
    {
        $this->data = [];
    }

    public function token(): string
    {
        return 'token';
    }

    public function previousUrl(): ?string
    {
        return null;
    }

    public function setPreviousUrl($url): void {}

    public function id(): ?string
    {
        return 'test';
    }

    public function setId($id): void {}

    public function getName(): string
    {
        return 'test';
    }

    public function setName($name): void {}

    public function driver(): \SessionHandlerInterface
    {
        throw new \RuntimeException('Not implemented');
    }

    public function handlerNeedsRequest(): bool
    {
        return false;
    }

    public function setRequestOnHandler($request): void {}
}
