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
        Schema::create('goals', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('target_amount', 10, 2);
            $table->decimal('current_amount', 10, 2)->default(0);
            $table->string('unit');
            $table->enum('category', [
                'fitness', 'health', 'education', 'career', 
                'finance', 'hobbies', 'relationship', 'personal', 'other'
            ]);
            $table->enum('status', ['active', 'in_progress', 'completed', 'canceled'])
                  ->default('active');
            $table->timestamp('start_date');
            $table->timestamp('end_date')->nullable();
            $table->text('punishment')->nullable();
            $table->boolean('is_public')->default(false);
            $table->timestamps();
            
            $table->index('user_id');
            $table->index('status');
            $table->index('category');
            $table->index('is_public');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('goals');
    }
};
