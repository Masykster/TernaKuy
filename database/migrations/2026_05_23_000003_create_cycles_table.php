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
        Schema::create('cycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('coop_id')->constrained()->cascadeOnDelete();
            $table->date('doc_date');
            $table->unsignedInteger('doc_count');
            $table->enum('strain', ['Ross', 'Cobb', 'Lohmann', 'Other']);
            $table->string('supplier_doc')->nullable();
            $table->decimal('price_doc', 10, 2)->nullable();
            $table->unsignedTinyInteger('target_days')->default(35);
            $table->enum('status', ['active', 'harvested', 'closed_forced'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cycles');
    }
};
