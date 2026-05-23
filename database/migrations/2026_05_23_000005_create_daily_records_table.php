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
        Schema::create('daily_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained()->cascadeOnDelete();
            $table->date('record_date');
            $table->unsignedInteger('day_number');
            $table->decimal('feed_kg', 8, 2);
            $table->unsignedInteger('mortality')->default(0);
            $table->decimal('avg_weight_g', 8, 2)->nullable();
            $table->unsignedInteger('live_population');
            $table->decimal('cum_feed_kg', 10, 2);
            $table->unsignedInteger('cum_mortality');
            $table->decimal('fcr_current', 5, 3)->nullable();
            $table->decimal('mortality_rate', 5, 2);
            $table->enum('condition', ['good', 'warning', 'critical'])->default('good');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['cycle_id', 'record_date']);
            $table->index(['cycle_id', 'record_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_records');
    }
};
