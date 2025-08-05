<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class GroupMember extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'group_id',
        'user_id',
        'role',
        'joined_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the group this membership belongs to.
     */
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class);
    }

    /**
     * Get the user this membership belongs to.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the member is an owner.
     */
    public function getIsOwnerAttribute(): bool
    {
        return $this->role === 'owner';
    }

    /**
     * Check if the member is an admin.
     */
    public function getIsAdminAttribute(): bool
    {
        return in_array($this->role, ['owner', 'admin']);
    }

    /**
     * Scope to get active members.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
