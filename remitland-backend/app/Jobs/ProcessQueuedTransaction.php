<?php

namespace App\Jobs;

use App\Models\Transaction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ProcessQueuedTransaction - Processes a queued transaction.
 *
 * Flow:
 * 1. Artisan command creates a transaction with status "Queued"
 * 2. This job is dispatched to the queue
 * 3. Queue worker picks it up (php artisan queue:work)
 * 4. Job changes status from "Queued" → "Pending"
 * 5. Notifies Socket.IO server so the new transaction appears
 *    in real-time on all connected browsers
 *
 * This simulates a real-world scenario where transactions are
 * submitted and processed asynchronously (e.g., via a payment gateway).
 */
class ProcessQueuedTransaction implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $transactionId;

    public function __construct(int $transactionId)
    {
        $this->transactionId = $transactionId;
    }

    public function handle(): void
    {
        $transaction = Transaction::find($this->transactionId);

        if (!$transaction || $transaction->status !== 'Queued') {
            return;
        }

        // Simulate processing delay (like a payment gateway callback)
        sleep(2);

        // Change status from Queued → Pending
        $transaction->update(['status' => 'Pending']);

        // Clear cache so the API returns fresh data
        Cache::forget("receiver.{$transaction->receiver_id}.transactions.{$transaction->currency_code}");

        // Notify Socket.IO server — this broadcasts a "new-transaction" event
        // so all connected browsers see the new transaction appear in real-time
        $socketUrl = env('SOCKET_SERVER_URL', 'http://localhost:6001');

        try {
            Http::timeout(2)->post("{$socketUrl}/notify", [
                'event' => 'new-transaction',
                'id' => $transaction->id,
                'status' => $transaction->status,
                'receiver_id' => $transaction->receiver_id,
                'currency_code' => $transaction->currency_code,
                'date_time' => $transaction->date_time->format('M d Y | H:i'),
                'request_id' => $transaction->request_id,
                'type' => $transaction->type,
                'type_detail' => $transaction->type_detail,
                'to_name' => $transaction->to_name,
                'amount' => number_format((float) $transaction->amount, 2),
            ]);
        } catch (\Exception $e) {
            Log::warning('Socket.IO server not reachable: ' . $e->getMessage());
        }
    }
}
