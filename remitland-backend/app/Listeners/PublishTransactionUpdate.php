<?php

namespace App\Listeners;

use App\Events\TransactionStatusUpdated;
use Illuminate\Support\Facades\Redis;

/**
 * Publishes transaction status changes to Redis.
 * The Node.js Socket.IO server subscribes to Redis and
 * broadcasts these changes to all connected frontend clients.
 */
class PublishTransactionUpdate
{
    public function handle(TransactionStatusUpdated $event): void
    {
        Redis::publish('transactions', json_encode([
            'id' => $event->transaction->id,
            'status' => $event->transaction->status,
            'old_status' => $event->oldStatus,
            'receiver_id' => $event->transaction->receiver_id,
            'currency_code' => $event->transaction->currency_code,
        ]));
    }
}
