<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('currencies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3);
            $table->string('flag_emoji', 10);
            $table->string('country');
            $table->string('bank_name');
            $table->string('branch_name');
            $table->string('swift_code');
            $table->string('account_number');
            $table->foreignId('receiver_id')->constrained()->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('currencies');
    }
};
