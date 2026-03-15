<?php

namespace Database\Seeders;

use App\Models\Currency;
use Illuminate\Database\Seeder;

class CurrencySeeder extends Seeder
{
    public function run(): void
    {
        $currencies = [
            [
                'code' => 'AUD',
                'flag_emoji' => '🇦🇺',
                'country' => 'Australia',
                'bank_name' => 'Commonwealth Bank',
                'branch_name' => 'Sydney Branch',
                'swift_code' => 'CTBAAU2S',
                'account_number' => '1982631287368',
                'receiver_id' => 1,
            ],
            [
                'code' => 'USD',
                'flag_emoji' => '🇺🇸',
                'country' => 'United States',
                'bank_name' => 'Bank of America',
                'branch_name' => 'Main Street Branch',
                'swift_code' => 'KJA98127',
                'account_number' => '1982631287368',
                'receiver_id' => 1,
            ],
            [
                'code' => 'CAD',
                'flag_emoji' => '🇨🇦',
                'country' => 'Canada',
                'bank_name' => 'Royal Bank of Canada',
                'branch_name' => 'Toronto Branch',
                'swift_code' => 'ROYCCAT2',
                'account_number' => '1982631287368',
                'receiver_id' => 1,
            ],
        ];

        foreach ($currencies as $currency) {
            Currency::create($currency);
        }
    }
}
