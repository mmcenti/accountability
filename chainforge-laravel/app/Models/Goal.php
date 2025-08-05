<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Goal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'name',
        'description',
        'target_amount',
        'current_amount',
        'unit',
        'category',
        'status',
        'start_date',
        'end_date',
        'punishment',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_public' => 'boolean',
        ];
    }

    /**
     * Get the user that owns this goal.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the progress entries for this goal.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(GoalProgress::class);
    }

    /**
     * Get the completion percentage.
     */
    public function getCompletionPercentageAttribute(): float
    {
        if ($this->target_amount == 0) {
            return 0;
        }
        
        return min(100, ($this->current_amount / $this->target_amount) * 100);
    }

    /**
     * Check if the goal is completed.
     */
    public function getIsCompletedAttribute(): bool
    {
        return $this->current_amount >= $this->target_amount;
    }

    /**
     * Get the remaining amount to complete the goal.
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->target_amount - $this->current_amount);
    }

    /**
     * Scope to get active goals.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Scope to get completed goals.
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope to get public goals.
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }
}
