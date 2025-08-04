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
        Schema::create('goal_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('goal_id');
            $table->decimal('amount', 10, 2);
            $table->text('note')->nullable();
            $table->timestamp('date');
            $table->timestamps();
            
            $table->foreign('goal_id')->references('id')->on('goals')->onDelete('cascade');
            $table->index('goal_id');
            $table->index('date');
            $table->index(['goal_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goal_progress');
    }
};
