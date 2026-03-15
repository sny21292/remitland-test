<?php

namespace Database\Seeders;

use App\Models\Receiver;
use Illuminate\Database\Seeder;

class ReceiverSeeder extends Seeder
{
    public function run(): void
    {
        Receiver::create([
            'id' => 1,
            'name' => 'John Bonham',
            'email' => 'john@email.com',
            'type' => 'Individual',
        ]);
    }
}
