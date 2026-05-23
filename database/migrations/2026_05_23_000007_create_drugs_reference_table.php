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
        Schema::create('drugs_reference', function (Blueprint $table) {
            $table->id();
            $table->string('drug_name', 100);
            $table->enum('category', ['antibiotic', 'vaccine', 'vitamin', 'other']);
            $table->unsignedInteger('withdrawal_days')->default(0);
            $table->string('description', 255)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drugs_reference');
    }
};
