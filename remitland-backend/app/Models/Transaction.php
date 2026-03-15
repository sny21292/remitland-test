<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'receiver_id', 'currency_id', 'date_time', 'request_id',
        'type', 'type_detail', 'to_name', 'amount', 'currency_code', 'status',
    ];

    protected $casts = [
        'date_time' => 'datetime',
        'amount' => 'decimal:2',
    ];

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(Receiver::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class);
    }
}
