<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReceiverResource;
use App\Http\Resources\TransactionResource;
use App\Models\Receiver;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ReceiverController extends Controller
{
    /**
     * Get receiver details with their currency accounts.
     * Uses Redis cache for 10 minutes to avoid repeated DB hits.
     */
    public function show(int $id)
    {
        $receiver = Cache::remember("receiver.{$id}", 600, function () use ($id) {
            return Receiver::with('currencies')->findOrFail($id);
        });

        return new ReceiverResource($receiver);
    }

    /**
     * Get transactions for a receiver, filtered by currency code.
     * Cached per receiver+currency combo, invalidated on status change.
     */
    public function transactions(Request $request, int $id)
    {
        $currencyCode = $request->query('currency', 'USD');

        $cacheKey = "receiver.{$id}.transactions.{$currencyCode}";

        $transactions = Cache::remember($cacheKey, 300, function () use ($id, $currencyCode) {
            return Receiver::findOrFail($id)
                ->transactions()
                ->where('currency_code', $currencyCode)
                ->orderBy('date_time', 'desc')
                ->get();
        });

        return TransactionResource::collection($transactions);
    }
}
