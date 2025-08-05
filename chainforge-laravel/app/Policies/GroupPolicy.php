<?php

namespace App\Policies;

use App\Models\Group;
use App\Models\GroupMember;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class GroupPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Group $group): bool
    {
        // Users can view groups they're members of, or public groups
        if (!$group->is_private) {
            return true;
        }

        return GroupMember::where('group_id', $group->id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Group $group): bool
    {
        $membership = GroupMember::where('group_id', $group->id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $membership && in_array($membership->role, ['owner', 'admin']);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Group $group): bool
    {
        $membership = GroupMember::where('group_id', $group->id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $membership && $membership->role === 'owner';
    }

    /**
     * Determine whether the user can create goals for the group.
     */
    public function createGoal(User $user, Group $group): bool
    {
        $membership = GroupMember::where('group_id', $group->id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $membership && in_array($membership->role, ['owner', 'admin']);
    }

    /**
     * Determine whether the user can manage group members.
     */
    public function manageMembers(User $user, Group $group): bool
    {
        $membership = GroupMember::where('group_id', $group->id)
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->first();

        return $membership && in_array($membership->role, ['owner', 'admin']);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Group $group): bool
    {
        return $group->created_by === $user->id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Group $group): bool
    {
        return $group->created_by === $user->id;
    }
}
