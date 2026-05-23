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
        Schema::create('weather_cache', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->constrained()->cascadeOnDelete();
            $table->decimal('temperature_c', 5, 2);
            $table->unsignedInteger('humidity_pct');
            $table->string('weather_desc', 100)->nullable();
            $table->decimal('wind_speed', 5, 2)->nullable();
            $table->enum('alert_level', ['normal', 'warning', 'critical'])->default('normal');
            $table->string('alert_message', 255)->nullable();
            $table->timestamp('fetched_at')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('weather_cache');
    }
};
