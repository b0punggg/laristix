<?php

namespace Tests\Feature\Admin;

use App\Modules\Auth\Models\User;
use App\Modules\Event\Enums\EventStatus;
use App\Modules\Event\Models\Event;
use App\Modules\Event\Models\EventWithdrawal;
use App\Modules\Organizer\Models\Organizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminWithdrawalTest extends TestCase
{
    use RefreshDatabase;

    private function createSuperAdmin(): User
    {
        return User::factory()->create([
            'platform_role' => 'super_admin',
            'status' => 'active',
        ]);
    }

    /**
     * @return array{0: Organizer, 1: Event, 2: EventWithdrawal}
     */
    private function createWithdrawalFixture(): array
    {
        $owner = User::factory()->create();

        $organizer = Organizer::query()->create([
            'uuid' => (string) Str::uuid(),
            'name' => 'Admin Withdrawal Org',
            'slug' => 'admin-withdrawal-org-'.Str::lower(Str::random(6)),
            'email' => 'admin-withdrawal@example.com',
            'status' => 'active',
        ]);

        $event = Event::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'created_by' => $owner->id,
            'title' => 'Admin Withdrawal Event',
            'slug' => 'admin-withdrawal-event',
            'status' => EventStatus::PUBLISHED,
            'visibility' => 'public',
            'start_at' => now()->addDay(),
            'end_at' => now()->addDays(2),
            'timezone' => 'Asia/Jakarta',
            'is_free' => false,
        ]);

        $withdrawal = EventWithdrawal::withoutOrganizerScope()->create([
            'uuid' => (string) Str::uuid(),
            'organizer_id' => $organizer->id,
            'event_id' => $event->id,
            'amount' => 125000,
            'status' => 'pending',
            'bank_name' => 'BCA',
            'account_holder' => 'Owner',
            'account_number' => '123456789',
            'requested_at' => now()->subHour(),
        ]);

        return [$organizer, $event, $withdrawal];
    }

    public function test_super_admin_can_list_withdrawals(): void
    {
        [, , $withdrawal] = $this->createWithdrawalFixture();
        Sanctum::actingAs($this->createSuperAdmin());

        $response = $this->getJson('/api/v1/admin/withdrawals');

        $response->assertOk();
        $response->assertJsonPath('data.0.uuid', $withdrawal->uuid);
        $response->assertJsonPath('data.0.status', 'pending');
    }

    public function test_super_admin_can_update_withdrawal_status(): void
    {
        [, , $withdrawal] = $this->createWithdrawalFixture();
        Sanctum::actingAs($this->createSuperAdmin());

        $response = $this->patchJson("/api/v1/admin/withdrawals/{$withdrawal->uuid}", [
            'status' => 'paid',
            'notes' => 'Transferred successfully',
            'invoice_number' => 'INV-WD-001',
            'invoice_url' => 'https://example.com/invoice.pdf',
            'supporting_document_url' => 'https://example.com/sot.pdf',
            'transfer_proof_url' => 'https://example.com/transfer.pdf',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.status', 'paid');
        $response->assertJsonPath('data.invoice_number', 'INV-WD-001');

        $this->assertDatabaseHas('event_withdrawals', [
            'uuid' => $withdrawal->uuid,
            'status' => 'paid',
            'notes' => 'Transferred successfully',
            'invoice_number' => 'INV-WD-001',
        ]);
    }

    public function test_super_admin_can_upload_withdrawal_document(): void
    {
        Storage::fake('public');

        [, , $withdrawal] = $this->createWithdrawalFixture();
        Sanctum::actingAs($this->createSuperAdmin());

        $response = $this->postJson(
            "/api/v1/admin/withdrawals/{$withdrawal->uuid}/documents",
            [
                'type' => 'invoice',
                'document' => UploadedFile::fake()->create('invoice.pdf', 200, 'application/pdf'),
            ]
        );

        $response->assertOk();
        $response->assertJsonPath('data.type', 'invoice');

        $withdrawal->refresh();
        $this->assertNotNull($withdrawal->invoice_url);
    }
}
