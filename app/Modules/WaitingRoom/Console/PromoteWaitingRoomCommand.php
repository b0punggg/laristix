<?php

namespace App\Modules\WaitingRoom\Console;

use App\Modules\WaitingRoom\Contracts\WaitingRoomServiceInterface;
use Illuminate\Console\Command;

class PromoteWaitingRoomCommand extends Command
{
    protected $signature = 'waiting-room:promote';

    protected $description = 'Promote waiting room sessions to admitted checkout slots';

    public function handle(WaitingRoomServiceInterface $waitingRoom): int
    {
        $promoted = $waitingRoom->promoteAllActiveEvents();

        $this->info("Promoted {$promoted} waiting room session(s).");

        return self::SUCCESS;
    }
}
