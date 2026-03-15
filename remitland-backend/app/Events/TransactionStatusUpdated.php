<?php

namespace App\Events;

use App\Models\Transaction;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * This event is fired when a transaction's status changes.
 * It publishes to Redis so the Node.js Socket.IO server can pick it up
 * and broadcast to all connected frontend clients in real-time.
 */
class TransactionStatusUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Transaction $transaction;
    public string $oldStatus;

    public function __construct(Transaction $transaction, string $oldStatus)
    {
        $this->transaction = $transaction;
        $this->oldStatus = $oldStatus;
    }

    public function broadcastOn(): array
    {
        return [
            new Channel('transactions'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'status.updated';
    }

    public function broadcastWith(): array
    {
        return [
            'id' => $this->transaction->id,
            'status' => $this->transaction->status,
            'old_status' => $this->oldStatus,
            'receiver_id' => $this->transaction->receiver_id,
            'currency_code' => $this->transaction->currency_code,
        ];
    }
}
