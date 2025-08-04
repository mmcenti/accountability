<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\GroupMember;
use App\Models\GroupGoal;
use App\Models\GroupGoalPeriod;
use App\Models\GroupGoalProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GroupController extends Controller
{
    /**
     * Display a listing of the user's groups.
     */
    public function index(Request $request)
    {
        $groups = $request->user()->groups()
            ->withPivot(['role', 'joined_at', 'is_active'])
            ->wherePivot('is_active', true)
            ->with(['goals' => function ($query) {
                $query->where('is_active', true)->latest();
            }, 'members' => function ($query) {
                $query->wherePivot('is_active', true)->with('user:id,first_name,last_name');
            }])
            ->get()
            ->map(function ($group) {
                return [
                    'id' => $group->id,
                    'name' => $group->name,
                    'description' => $group->description,
                    'invite_code' => $group->invite_code,
                    'max_members' => $group->max_members,
                    'is_private' => $group->is_private,
                    'status' => $group->status,
                    'role' => $group->pivot->role,
                    'joined_at' => $group->pivot->joined_at,
                    'member_count' => $group->members->count(),
                    'active_goals' => $group->goals->count(),
                    'created_at' => $group->created_at,
                ];
            });

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
        ]);
    }

    /**
     * Show the form for creating a new group.
     */
    public function create()
    {
        return Inertia::render('Groups/Create');
    }

    /**
     * Store a newly created group.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'max_members' => 'required|integer|min:2|max:100',
            'is_private' => 'boolean',
        ]);

        $group = Group::create([
            'id' => Str::uuid(),
            'name' => $request->name,
            'description' => $request->description,
            'invite_code' => Group::generateInviteCode(),
            'max_members' => $request->max_members,
            'is_private' => $request->boolean('is_private'),
            'created_by' => $request->user()->id,
        ]);

        // Add creator as owner
        GroupMember::create([
            'id' => Str::uuid(),
            'group_id' => $group->id,
            'user_id' => $request->user()->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        return redirect()->route('groups.show', $group)
            ->with('success', 'Group created successfully!');
    }

    /**
     * Display the specified group.
     */
    public function show(Group $group)
    {
        $this->authorize('view', $group);

        $group->load([
            'members' => function ($query) {
                $query->active()->with('user:id,first_name,last_name,avatar');
            },
            'goals' => function ($query) {
                $query->where('is_active', true)->with(['periods' => function ($periodQuery) {
                    $periodQuery->where('is_active', true)->with(['progress' => function ($progressQuery) {
                        $progressQuery->with('user:id,first_name,last_name');
                    }]);
                }]);
            }
        ]);

        $userMembership = $group->members->where('user_id', auth()->id())->first();

        return Inertia::render('Groups/Show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'invite_code' => $group->invite_code,
                'max_members' => $group->max_members,
                'is_private' => $group->is_private,
                'status' => $group->status,
                'created_at' => $group->created_at,
                'member_count' => $group->members->count(),
                'user_role' => $userMembership?->role,
                'user_is_admin' => $userMembership?->is_admin ?? false,
            ],
            'members' => $group->members->map(function ($member) {
                return [
                    'id' => $member->id,
                    'role' => $member->role,
                    'joined_at' => $member->joined_at,
                    'user' => $member->user,
                ];
            }),
            'goals' => $group->goals->map(function ($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'description' => $goal->description,
                    'unit' => $goal->unit,
                    'period_type' => $goal->period_type,
                    'created_at' => $goal->created_at,
                    'current_period' => $goal->periods->where('is_active', true)->first(),
                    'progress_summary' => $this->getGoalProgressSummary($goal),
                ];
            }),
        ]);
    }

    /**
     * Join a group using invite code.
     */
    public function join(Request $request)
    {
        $request->validate([
            'invite_code' => 'required|string|size:8',
        ]);

        $group = Group::where('invite_code', strtoupper($request->invite_code))
            ->where('status', 'active')
            ->first();

        if (!$group) {
            return back()->withErrors(['invite_code' => 'Invalid invite code.']);
        }

        // Check if user is already a member
        $existingMember = GroupMember::where('group_id', $group->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingMember) {
            if ($existingMember->is_active) {
                return redirect()->route('groups.show', $group)
                    ->with('info', 'You are already a member of this group.');
            } else {
                // Reactivate membership
                $existingMember->update(['is_active' => true, 'joined_at' => now()]);
                return redirect()->route('groups.show', $group)
                    ->with('success', 'Welcome back to the group!');
            }
        }

        // Check if group is full
        $memberCount = $group->members()->active()->count();
        if ($memberCount >= $group->max_members) {
            return back()->withErrors(['invite_code' => 'This group is full.']);
        }

        // Add user to group
        GroupMember::create([
            'id' => Str::uuid(),
            'group_id' => $group->id,
            'user_id' => $request->user()->id,
            'role' => 'member',
            'joined_at' => now(),
        ]);

        return redirect()->route('groups.show', $group)
            ->with('success', 'Successfully joined the group!');
    }

    /**
     * Leave a group.
     */
    public function leave(Group $group)
    {
        $membership = GroupMember::where('group_id', $group->id)
            ->where('user_id', auth()->id())
            ->first();

        if (!$membership) {
            return back()->withErrors(['error' => 'You are not a member of this group.']);
        }

        if ($membership->role === 'owner') {
            return back()->withErrors(['error' => 'Owners cannot leave the group. Transfer ownership first.']);
        }

        $membership->update(['is_active' => false]);

        return redirect()->route('groups.index')
            ->with('success', 'You have left the group.');
    }

    /**
     * Create a new goal for the group.
     */
    public function createGoal(Request $request, Group $group)
    {
        $this->authorize('createGoal', $group);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'unit' => 'required|string|max:50',
            'period_type' => 'required|in:weekly,monthly',
        ]);

        $goal = GroupGoal::create([
            'id' => Str::uuid(),
            'group_id' => $group->id,
            'name' => $request->name,
            'description' => $request->description,
            'unit' => $request->unit,
            'period_type' => $request->period_type,
            'created_by' => $request->user()->id,
        ]);

        // Create first period
        $startDate = now();
        $endDate = $request->period_type === 'weekly' 
            ? $startDate->copy()->addWeek() 
            : $startDate->copy()->addMonth();

        $period = GroupGoalPeriod::create([
            'id' => Str::uuid(),
            'group_goal_id' => $goal->id,
            'start_date' => $startDate,
            'end_date' => $endDate,
        ]);

        return back()->with('success', 'Group goal created successfully!');
    }

    /**
     * Set individual target for a group goal period.
     */
    public function setTarget(Request $request, GroupGoalPeriod $period)
    {
        $request->validate([
            'target_amount' => 'required|numeric|min:0.01',
        ]);

        $existingProgress = GroupGoalProgress::where('group_goal_period_id', $period->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existingProgress) {
            $existingProgress->update([
                'target_amount' => $request->target_amount,
            ]);
        } else {
            GroupGoalProgress::create([
                'id' => Str::uuid(),
                'group_goal_period_id' => $period->id,
                'user_id' => $request->user()->id,
                'target_amount' => $request->target_amount,
            ]);
        }

        return back()->with('success', 'Target set successfully!');
    }

    /**
     * Add progress to a group goal.
     */
    public function addProgress(Request $request, GroupGoalPeriod $period)
    {
        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'date' => 'required|date|before_or_equal:today',
        ]);

        $progress = GroupGoalProgress::where('group_goal_period_id', $period->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$progress) {
            return back()->withErrors(['error' => 'Please set your target first.']);
        }

        // Update daily entries
        $dailyEntries = json_decode($progress->daily_entries, true) ?? [];
        $dateKey = $request->date;
        
        if (!isset($dailyEntries[$dateKey])) {
            $dailyEntries[$dateKey] = 0;
        }
        $dailyEntries[$dateKey] += $request->amount;

        $newCurrentAmount = array_sum($dailyEntries);

        $progress->update([
            'current_amount' => $newCurrentAmount,
            'daily_entries' => json_encode($dailyEntries),
            'is_completed' => $newCurrentAmount >= $progress->target_amount,
        ]);

        return back()->with('success', 'Progress added successfully!');
    }

    /**
     * Get goal progress summary for display.
     */
    private function getGoalProgressSummary(GroupGoal $goal)
    {
        $currentPeriod = $goal->periods->where('is_active', true)->first();
        
        if (!$currentPeriod) {
            return null;
        }

        $allProgress = $currentPeriod->progress;
        $totalParticipants = $allProgress->count();
        $completedCount = $allProgress->where('is_completed', true)->count();
        $averageCompletion = $totalParticipants > 0 
            ? $allProgress->avg(function ($p) { 
                return $p->target_amount > 0 ? ($p->current_amount / $p->target_amount) * 100 : 0; 
              })
            : 0;

        return [
            'total_participants' => $totalParticipants,
            'completed_count' => $completedCount,
            'average_completion' => round($averageCompletion, 1),
            'period_end' => $currentPeriod->end_date,
        ];
    }
}
