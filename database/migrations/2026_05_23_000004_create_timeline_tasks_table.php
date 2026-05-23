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
        Schema::create('timeline_tasks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cycle_id')->constrained()->cascadeOnDelete();
            $table->date('task_date');
            $table->unsignedInteger('day_number');
            $table->string('task_name', 200);
            $table->enum('category', ['vaccination', 'sampling', 'feeding', 'management', 'custom']);
            $table->boolean('is_system')->default(true);
            $table->boolean('is_done')->default(false);
            $table->timestamp('done_at')->nullable();
            $table->boolean('notify')->default(true);
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('timeline_tasks');
    }
};
