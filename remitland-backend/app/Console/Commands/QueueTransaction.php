<?php

namespace App\Console\Commands;

use App\Jobs\ProcessQueuedTransaction;
use App\Models\Transaction;
use Illuminate\Console\Command;

/**
 * Artisan command to simulate a new transaction being queued.
 *
 * Usage:
 *   php artisan transactions:queue           # Queue a random transaction
 *   php artisan transactions:queue --currency=USD  # Queue for specific currency
 *
 * This creates a transaction with status "Queued", then dispatches
 * a ProcessQueuedTransaction job. When the queue worker processes it,
 * the status changes to "Pending" and it appears on all connected browsers.
 *
 * To see it work:
 * 1. Start the queue worker: php artisan queue:work
 * 2. Run this command: php artisan transactions:queue
 * 3. Watch the browser — the new transaction appears in ~2 seconds
 */
class QueueTransaction extends Command
{
    protected $signature = 'transactions:queue {--currency= : Currency code (USD, AUD, CAD)}';
    protected $description = 'Queue a new transaction for processing (simulates incoming payment)';

    private array $names = ['John Bonham', 'Emily Carter', 'Sarah Johnson', 'David Wilson'];
    private array $types = ['Send Money', 'Add Money'];
    private array $typeDetails = ['International', 'Domestic', null];

    public function handle(): void
    {
        $currencies = ['USD' => 2, 'AUD' => 1, 'CAD' => 3];
        $currencyCode = $this->option('currency') ?: array_rand($currencies);
        $currencyId = $currencies[$currencyCode] ?? 2;

        // Generate a random request ID like "7X3K9P2Q"
        $requestId = strtoupper(substr(str_shuffle('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 0, 8));

        $transaction = Transaction::create([
            'receiver_id' => 1,
            'currency_id' => $currencyId,
            'date_time' => now(),
            'request_id' => $requestId,
            'type' => $this->types[array_rand($this->types)],
            'type_detail' => $this->typeDetails[array_rand($this->typeDetails)],
            'to_name' => $this->names[array_rand($this->names)],
            'amount' => rand(1000, 50000),
            'currency_code' => $currencyCode,
            'status' => 'Queued',
        ]);

        $this->info("Transaction #{$transaction->id} created with status 'Queued'");
        $this->info("  Currency: {$currencyCode} | Amount: {$transaction->amount} | To: {$transaction->to_name}");

        // Dispatch the job to process this transaction
        ProcessQueuedTransaction::dispatch($transaction->id);

        $this->info("Job dispatched — run 'php artisan queue:work' to process it");
    }
}
