<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GroupGoal extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'group_id',
        'name',
        'description',
        'unit',
        'period_type',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the group this goal belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the user who created this goal.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the periods for this goal.
     */
    public function periods(): HasMany
    {
        return $this->hasMany(GroupGoalPeriod::class);
    }

    /**
     * Get the current active period.
     */
    public function getCurrentPeriodAttribute()
    {
        return $this->periods()->where('is_active', true)->first();
    }

    /**
     * Scope to get active goals.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
