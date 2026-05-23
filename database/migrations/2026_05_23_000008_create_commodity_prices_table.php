<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('commodity_prices', function (Blueprint $table) {
            $table->id();
            $table->string('commodity', 20); // CORN|SOYBEAN|RICEBRAN
            $table->decimal('price_usd', 10, 4)->nullable();
            $table->decimal('price_idr', 12, 2)->nullable();
            $table->decimal('change_pct_30d', 5, 2)->nullable();
            $table->date('recorded_date');
            $table->string('source', 50)->nullable();
            $table->timestamps();

            $table->unique(['commodity', 'recorded_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('commodity_prices');
    }
};
