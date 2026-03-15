<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class TransactionController extends Controller
{
    /**
     * Update a transaction's status.
     *
     * Real-time flow:
     * 1. Updates the DB
     * 2. Clears the cache
     * 3. POSTs to Socket.IO server
     * 4. Socket.IO broadcasts to all connected browsers
     */
    public function updateStatus(Request $request, int $id)
    {
        $request->validate([
            'status' => ['required', Rule::in(['Pending', 'Approved'])],
        ]);

        $transaction = Transaction::findOrFail($id);
        $oldStatus = $transaction->status;
        $transaction->update(['status' => $request->status]);

        // Clear cached transactions so the next API call returns fresh data
        Cache::forget("receiver.{$transaction->receiver_id}.transactions.{$transaction->currency_code}");

        // Notify Socket.IO server — broadcasts to all connected browsers
        $this->notifySocketServer([
            'event' => 'status-updated',
            'id' => $transaction->id,
            'status' => $transaction->status,
            'old_status' => $oldStatus,
            'receiver_id' => $transaction->receiver_id,
            'currency_code' => $transaction->currency_code,
        ]);

        return new TransactionResource($transaction->fresh());
    }

    /**
     * POST event data to the Node.js Socket.IO server.
     * If the socket server isn't running, log a warning and continue.
     */
    private function notifySocketServer(array $data): void
    {
        $socketUrl = env('SOCKET_SERVER_URL', 'http://localhost:6001');

        try {
            Http::timeout(2)->post("{$socketUrl}/notify", $data);
        } catch (\Exception $e) {
            Log::warning('Socket.IO server not reachable: ' . $e->getMessage());
        }
    }
}
