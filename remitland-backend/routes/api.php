<?php

use App\Http\Controllers\Api\CurrencyController;
use App\Http\Controllers\Api\ReceiverController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Support\Facades\Route;

// Receiver endpoints
Route::get('/receivers/{id}', [ReceiverController::class, 'show']);
Route::get('/receivers/{id}/transactions', [ReceiverController::class, 'transactions']);

// Transaction status update (for real-time demo)
Route::patch('/transactions/{id}/status', [TransactionController::class, 'updateStatus']);

// Currencies list
Route::get('/currencies', [CurrencyController::class, 'index']);

// Download sample file
Route::get('/download', function () {
    $path = public_path('sample.txt');
    return response()->download($path, 'RemitLand_Receipt.txt');
});
