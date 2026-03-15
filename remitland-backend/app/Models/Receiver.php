<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Receiver extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'email', 'type'];

    public function currencies(): HasMany
    {
        return $this->hasMany(Currency::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
