<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CurrencyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'flag_emoji' => $this->flag_emoji,
            'country' => $this->country,
            'bank_name' => $this->bank_name,
            'branch_name' => $this->branch_name,
            'swift_code' => $this->swift_code,
            'account_number' => $this->account_number,
        ];
    }
}
