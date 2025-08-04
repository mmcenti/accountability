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
        Schema::create('subscription_usage', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->uuid('subscription_id');
            $table->integer('personal_goals')->default(0);
            $table->integer('group_goals')->default(0);
            $table->integer('groups_joined')->default(0);
            $table->integer('api_requests')->default(0);
            $table->integer('storage_used')->default(0);
            $table->timestamp('period_start');
            $table->timestamp('period_end');
            $table->timestamps();
            
            $table->foreign('subscription_id')->references('id')->on('subscriptions')->onDelete('cascade');
            $table->index('user_id');
            $table->index('subscription_id');
            $table->index(['period_start', 'period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscription_usage');
    }
};
