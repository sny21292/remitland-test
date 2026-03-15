<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date_time' => $this->date_time->format('M d Y | H:i'),
            'request_id' => $this->request_id,
            'type' => $this->type,
            'type_detail' => $this->type_detail,
            'to_name' => $this->to_name,
            'amount' => number_format((float) $this->amount, 2),
            'currency_code' => $this->currency_code,
            'status' => $this->status,
            'receiver_id' => $this->receiver_id,
        ];
    }
}
