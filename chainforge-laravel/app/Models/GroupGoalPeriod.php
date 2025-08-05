<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GroupGoalPeriod extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'group_goal_id',
        'start_date',
        'end_date',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the group goal this period belongs to.
     */
    public function groupGoal(): BelongsTo
    {
        return $this->belongsTo(GroupGoal::class);
    }

    /**
     * Get the progress entries for this period.
     */
    public function progress(): HasMany
    {
        return $this->hasMany(GroupGoalProgress::class);
    }

    /**
     * Check if the period is currently active.
     */
    public function getIsCurrentAttribute(): bool
    {
        $now = now();
        return $this->start_date <= $now && $this->end_date >= $now;
    }

    /**
     * Check if the period has ended.
     */
    public function getHasEndedAttribute(): bool
    {
        return $this->end_date < now();
    }

    /**
     * Get days remaining in the period.
     */
    public function getDaysRemainingAttribute(): int
    {
        if ($this->has_ended) {
            return 0;
        }
        
        return now()->diffInDays($this->end_date);
    }

    /**
     * Scope to get active periods.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get current periods.
     */
    public function scopeCurrent($query)
    {
        $now = now();
        return $query->where('start_date', '<=', $now)
                    ->where('end_date', '>=', $now);
    }
}
