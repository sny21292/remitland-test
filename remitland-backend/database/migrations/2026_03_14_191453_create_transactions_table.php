<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('receiver_id')->constrained()->onDelete('cascade');
            $table->foreignId('currency_id')->constrained()->onDelete('cascade');
            $table->dateTime('date_time');
            $table->string('request_id');
            $table->string('type');
            $table->string('type_detail')->nullable();
            $table->string('to_name');
            $table->decimal('amount', 15, 2);
            $table->string('currency_code', 3);
            // Using string instead of enum for PostgreSQL (Supabase) compatibility
            $table->string('status')->default('Pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
