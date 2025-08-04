<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class Group extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'description',
        'invite_code',
        'max_members',
        'is_private',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_private' => 'boolean',
        ];
    }

    /**
     * Get the user who created this group.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the members of this group.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'group_members')
                    ->withPivot(['role', 'joined_at', 'is_active'])
                    ->withTimestamps();
    }

    /**
     * Get the group memberships.
     */
    public function memberships(): HasMany
    {
        return $this->hasMany(GroupMember::class);
    }

    /**
     * Get the goals for this group.
     */
    public function goals(): HasMany
    {
        return $this->hasMany(GroupGoal::class);
    }

    /**
     * Generate a unique invite code.
     */
    public static function generateInviteCode(): string
    {
        do {
            $code = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        } while (self::where('invite_code', $code)->exists());

        return $code;
    }

    /**
     * Scope to get active groups.
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
