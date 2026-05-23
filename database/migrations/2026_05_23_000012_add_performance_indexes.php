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
        Schema::table('health_records', function (Blueprint $table) {
            $table->index(['cycle_id', 'withdrawal_end']);
        });

        Schema::table('commodity_prices', function (Blueprint $table) {
            $table->index(['commodity', 'recorded_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commodity_prices', function (Blueprint $table) {
            $table->dropIndex(['commodity_prices_commodity_recorded_date_index']);
        });

        Schema::table('health_records', function (Blueprint $table) {
            $table->dropIndex(['health_records_cycle_id_withdrawal_end_index']);
        });
    }
};
