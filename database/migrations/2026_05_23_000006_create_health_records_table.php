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
        Schema::create('health_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained()->cascadeOnDelete();
            $table->date('record_date');
            $table->enum('record_type', ['vaccination', 'treatment', 'observation']);
            $table->string('drug_name', 100);
            $table->string('dosage', 50)->nullable();
            $table->enum('method', ['drinking_water', 'eye_drop', 'injection', 'feed', 'spray'])->nullable();
            $table->unsignedInteger('withdrawal_days')->default(0);
            $table->date('withdrawal_end')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('health_records');
    }
};
