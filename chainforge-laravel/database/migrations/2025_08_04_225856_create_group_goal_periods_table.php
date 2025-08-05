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
        Schema::create('group_goal_periods', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('group_goal_id');
            $table->timestamp('start_date');
            $table->timestamp('end_date');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->foreign('group_goal_id')->references('id')->on('group_goals')->onDelete('cascade');
            $table->index('group_goal_id');
            $table->index(['start_date', 'end_date']);
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_goal_periods');
    }
};
