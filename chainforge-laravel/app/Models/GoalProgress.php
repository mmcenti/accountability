<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GoalProgress extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'goal_progress';

    protected $fillable = [
        'goal_id',
        'amount',
        'note',
        'date',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'date' => 'datetime',
        ];
    }

    /**
     * Get the goal that owns this progress entry.
     */
    public function goal(): BelongsTo
    {
        return $this->belongsTo(Goal::class);
    }
}
