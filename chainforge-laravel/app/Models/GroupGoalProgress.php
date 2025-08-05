<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GroupGoalProgress extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'group_goal_progress';

    protected $fillable = [
        'group_goal_period_id',
        'user_id',
        'target_amount',
        'current_amount',
        'penalty_carry_over',
        'daily_entries',
        'is_completed',
    ];

    protected function casts(): array
    {
        return [
            'target_amount' => 'decimal:2',
            'current_amount' => 'decimal:2',
            'penalty_carry_over' => 'decimal:2',
            'daily_entries' => 'array',
            'is_completed' => 'boolean',
        ];
    }

    /**
     * Get the group goal period this progress belongs to.
     */
    public function period(): BelongsTo
    {
        return $this->belongsTo(GroupGoalPeriod::class, 'group_goal_period_id');
    }

    /**
     * Get the user this progress belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the effective target including penalty carry-over.
     */
    public function getEffectiveTargetAttribute(): float
    {
        return $this->target_amount + $this->penalty_carry_over;
    }

    /**
     * Get the completion percentage.
     */
    public function getCompletionPercentageAttribute(): float
    {
        if ($this->effective_target == 0) {
            return 0;
        }
        
        return min(100, ($this->current_amount / $this->effective_target) * 100);
    }

    /**
     * Get the remaining amount to complete.
     */
    public function getRemainingAmountAttribute(): float
    {
        return max(0, $this->effective_target - $this->current_amount);
    }

    /**
     * Check if this progress failed the target.
     */
    public function getHasFailedAttribute(): bool
    {
        $period = $this->period;
        return $period->has_ended && $this->current_amount < $this->effective_target;
    }

    /**
     * Calculate penalty for next period.
     */
    public function calculatePenalty(): float
    {
        if (!$this->has_failed) {
            return 0;
        }

        return $this->remaining_amount;
    }

    /**
     * Get daily progress for a specific date.
     */
    public function getDailyProgress(string $date): float
    {
        return $this->daily_entries[$date] ?? 0;
    }

    /**
     * Get progress streak (consecutive days with progress).
     */
    public function getProgressStreakAttribute(): int
    {
        $entries = $this->daily_entries;
        $streak = 0;
        $currentStreak = 0;

        // Sort dates in descending order
        $dates = array_keys($entries);
        rsort($dates);

        $yesterday = now()->subDay()->format('Y-m-d');

        foreach ($dates as $date) {
            if ($entries[$date] > 0) {
                if ($date === $yesterday || $date === now()->format('Y-m-d')) {
                    $currentStreak++;
                    $yesterday = \Carbon\Carbon::parse($date)->subDay()->format('Y-m-d');
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return $currentStreak;
    }

    /**
     * Scope to get completed progress.
     */
    public function scopeCompleted($query)
    {
        return $query->where('is_completed', true);
    }

    /**
     * Scope to get failed progress.
     */
    public function scopeFailed($query)
    {
        return $query->whereHas('period', function ($periodQuery) {
            $periodQuery->where('end_date', '<', now());
        })->where('is_completed', false);
    }
}
