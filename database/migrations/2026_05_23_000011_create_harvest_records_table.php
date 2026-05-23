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
        Schema::create('harvest_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->unique()->constrained()->cascadeOnDelete();
            $table->date('harvest_date');
            $table->unsignedInteger('harvest_count');
            $table->decimal('total_weight_kg', 10, 2);
            $table->decimal('avg_weight_kg', 6, 3)->nullable();
            $table->decimal('price_per_kg', 10, 2)->nullable();
            $table->decimal('total_revenue', 15, 2)->nullable();
            $table->decimal('fcr_final', 5, 3)->nullable();
            $table->decimal('ip_score', 7, 2)->nullable();
            $table->decimal('mortality_rate', 5, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('harvest_records');
    }
};
