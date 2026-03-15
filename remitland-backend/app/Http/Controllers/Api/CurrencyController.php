<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CurrencyResource;
use App\Models\Currency;
use Illuminate\Support\Facades\Cache;

class CurrencyController extends Controller
{
    /**
     * List all available currencies.
     * Cached for 1 hour since currencies rarely change.
     */
    public function index()
    {
        $currencies = Cache::remember('currencies.all', 3600, function () {
            return Currency::all();
        });

        return CurrencyResource::collection($currencies);
    }
}
