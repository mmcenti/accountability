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
        Schema::create('group_goal_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('group_goal_period_id');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->decimal('target_amount', 10, 2);
            $table->decimal('current_amount', 10, 2)->default(0);
            $table->decimal('penalty_carry_over', 10, 2)->default(0);
            $table->json('daily_entries')->default('[]');
            $table->boolean('is_completed')->default(false);
            $table->timestamps();
            
            $table->foreign('group_goal_period_id')->references('id')->on('group_goal_periods')->onDelete('cascade');
            $table->unique(['group_goal_period_id', 'user_id']);
            $table->index('user_id');
            $table->index('group_goal_period_id');
            $table->index('is_completed');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_goal_progress');
    }
};
