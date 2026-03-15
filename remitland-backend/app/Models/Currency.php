<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Currency extends Model
{
    use HasFactory;

    protected $fillable = [
        'code', 'flag_emoji', 'country', 'bank_name',
        'branch_name', 'swift_code', 'account_number', 'receiver_id',
    ];

    public function receiver(): BelongsTo
    {
        return $this->belongsTo(Receiver::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
