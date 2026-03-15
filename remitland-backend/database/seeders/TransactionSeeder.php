<?php

namespace Database\Seeders;

use App\Models\Transaction;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $transactions = [
            // USD transactions (currency_id = 2)
            [
                'receiver_id' => 1, 'currency_id' => 2,
                'date_time' => '2025-04-19 14:30:00', 'request_id' => '6A5S1D5A',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'John Bonham', 'amount' => 12000.00,
                'currency_code' => 'USD', 'status' => 'Pending',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 2,
                'date_time' => '2025-04-19 14:30:00', 'request_id' => '6A5S1D5A',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Emily Carter', 'amount' => 50000.00,
                'currency_code' => 'USD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 2,
                'date_time' => '2025-04-19 14:30:00', 'request_id' => '6A5S1D5A',
                'type' => 'Send Money', 'type_detail' => 'Domestic',
                'to_name' => 'Emily Carter', 'amount' => 50000.00,
                'currency_code' => 'USD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 2,
                'date_time' => '2025-04-19 14:30:00', 'request_id' => '6A5S1D5A',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Emily Carter', 'amount' => 12000.00,
                'currency_code' => 'USD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 2,
                'date_time' => '2025-05-10 09:15:00', 'request_id' => '7B6T2E6B',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'John Bonham', 'amount' => 8500.00,
                'currency_code' => 'USD', 'status' => 'Pending',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 2,
                'date_time' => '2025-06-12 20:15:00', 'request_id' => '8C7U3F7C',
                'type' => 'Add Money', 'type_detail' => null,
                'to_name' => 'You', 'amount' => 50000.00,
                'currency_code' => 'USD', 'status' => 'Approved',
            ],

            // AUD transactions (currency_id = 1)
            [
                'receiver_id' => 1, 'currency_id' => 1,
                'date_time' => '2025-04-19 14:30:00', 'request_id' => '6A5S1D5A',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Emily Carter', 'amount' => 50000.00,
                'currency_code' => 'AUD', 'status' => 'Pending',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 1,
                'date_time' => '2025-04-19 14:30:00', 'request_id' => '6A5S1D5A',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Emily Carter', 'amount' => 50000.00,
                'currency_code' => 'AUD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 1,
                'date_time' => '2025-05-02 11:00:00', 'request_id' => '9D8V4G8D',
                'type' => 'Send Money', 'type_detail' => 'Domestic',
                'to_name' => 'John Bonham', 'amount' => 25000.00,
                'currency_code' => 'AUD', 'status' => 'Pending',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 1,
                'date_time' => '2025-05-15 16:45:00', 'request_id' => '1E9W5H9E',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Sarah Johnson', 'amount' => 15000.00,
                'currency_code' => 'AUD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 1,
                'date_time' => '2025-06-01 08:30:00', 'request_id' => '2F1X6I1F',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Emily Carter', 'amount' => 32000.00,
                'currency_code' => 'AUD', 'status' => 'Approved',
            ],

            // CAD transactions (currency_id = 3)
            [
                'receiver_id' => 1, 'currency_id' => 3,
                'date_time' => '2025-04-25 10:00:00', 'request_id' => '3G2Y7J2G',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'John Bonham', 'amount' => 18000.00,
                'currency_code' => 'CAD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 3,
                'date_time' => '2025-05-08 13:20:00', 'request_id' => '4H3Z8K3H',
                'type' => 'Send Money', 'type_detail' => 'Domestic',
                'to_name' => 'Sarah Johnson', 'amount' => 7500.00,
                'currency_code' => 'CAD', 'status' => 'Pending',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 3,
                'date_time' => '2025-05-20 17:00:00', 'request_id' => '5I4A9L4I',
                'type' => 'Send Money', 'type_detail' => 'International',
                'to_name' => 'Emily Carter', 'amount' => 42000.00,
                'currency_code' => 'CAD', 'status' => 'Approved',
            ],
            [
                'receiver_id' => 1, 'currency_id' => 3,
                'date_time' => '2025-06-05 12:00:00', 'request_id' => '6J5B1M5J',
                'type' => 'Add Money', 'type_detail' => null,
                'to_name' => 'You', 'amount' => 30000.00,
                'currency_code' => 'CAD', 'status' => 'Pending',
            ],
        ];

        foreach ($transactions as $tx) {
            Transaction::create($tx);
        }
    }
}
