<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class GoalController extends Controller
{
    /**
     * Display a listing of the user's goals.
     */
    public function index(Request $request)
    {
        $goals = $request->user()->goals()
            ->with('progress')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($goal) {
                return [
                    'id' => $goal->id,
                    'name' => $goal->name,
                    'description' => $goal->description,
                    'target_amount' => $goal->target_amount,
                    'current_amount' => $goal->current_amount,
                    'unit' => $goal->unit,
                    'category' => $goal->category,
                    'status' => $goal->status,
                    'start_date' => $goal->start_date,
                    'end_date' => $goal->end_date,
                    'punishment' => $goal->punishment,
                    'is_public' => $goal->is_public,
                    'completion_percentage' => $goal->completion_percentage,
                    'is_completed' => $goal->is_completed,
                    'remaining_amount' => $goal->remaining_amount,
                    'progress_count' => $goal->progress->count(),
                    'created_at' => $goal->created_at,
                ];
            });

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
        ]);
    }

    /**
     * Show the form for creating a new goal.
     */
    public function create()
    {
        $categories = [
            'fitness' => 'Fitness & Exercise',
            'health' => 'Health & Wellness',
            'education' => 'Education & Learning',
            'career' => 'Career & Professional',
            'finance' => 'Finance & Money',
            'hobbies' => 'Hobbies & Interests',
            'relationship' => 'Relationships',
            'personal' => 'Personal Development',
            'other' => 'Other'
        ];

        return Inertia::render('Goals/Create', [
            'categories' => $categories,
        ]);
    }

    /**
     * Store a newly created goal.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'target_amount' => 'required|numeric|min:0.01',
            'unit' => 'required|string|max:50',
            'category' => 'required|in:fitness,health,education,career,finance,hobbies,relationship,personal,other',
            'start_date' => 'required|date|after_or_equal:today',
            'end_date' => 'nullable|date|after:start_date',
            'punishment' => 'nullable|string|max:500',
            'is_public' => 'boolean',
        ]);

        $goal = Goal::create([
            'id' => Str::uuid(),
            'user_id' => $request->user()->id,
            'name' => $request->name,
            'description' => $request->description,
            'target_amount' => $request->target_amount,
            'unit' => $request->unit,
            'category' => $request->category,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'punishment' => $request->punishment,
            'is_public' => $request->boolean('is_public'),
        ]);

        return redirect()->route('goals.show', $goal)
            ->with('success', 'Goal created successfully!');
    }

    /**
     * Display the specified goal.
     */
    public function show(Goal $goal)
    {
        $this->authorize('view', $goal);

        $goal->load('progress');

        $progressData = $goal->progress()
            ->orderBy('date', 'desc')
            ->get()
            ->map(function ($progress) {
                return [
                    'id' => $progress->id,
                    'amount' => $progress->amount,
                    'note' => $progress->note,
                    'date' => $progress->date,
                    'created_at' => $progress->created_at,
                ];
            });

        return Inertia::render('Goals/Show', [
            'goal' => [
                'id' => $goal->id,
                'name' => $goal->name,
                'description' => $goal->description,
                'target_amount' => $goal->target_amount,
                'current_amount' => $goal->current_amount,
                'unit' => $goal->unit,
                'category' => $goal->category,
                'status' => $goal->status,
                'start_date' => $goal->start_date,
                'end_date' => $goal->end_date,
                'punishment' => $goal->punishment,
                'is_public' => $goal->is_public,
                'completion_percentage' => $goal->completion_percentage,
                'is_completed' => $goal->is_completed,
                'remaining_amount' => $goal->remaining_amount,
                'created_at' => $goal->created_at,
            ],
            'progress' => $progressData,
        ]);
    }

    /**
     * Show the form for editing the goal.
     */
    public function edit(Goal $goal)
    {
        $this->authorize('update', $goal);

        $categories = [
            'fitness' => 'Fitness & Exercise',
            'health' => 'Health & Wellness',
            'education' => 'Education & Learning',
            'career' => 'Career & Professional',
            'finance' => 'Finance & Money',
            'hobbies' => 'Hobbies & Interests',
            'relationship' => 'Relationships',
            'personal' => 'Personal Development',
            'other' => 'Other'
        ];

        return Inertia::render('Goals/Edit', [
            'goal' => $goal,
            'categories' => $categories,
        ]);
    }

    /**
     * Update the specified goal.
     */
    public function update(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'target_amount' => 'required|numeric|min:0.01',
            'unit' => 'required|string|max:50',
            'category' => 'required|in:fitness,health,education,career,finance,hobbies,relationship,personal,other',
            'end_date' => 'nullable|date|after:start_date',
            'punishment' => 'nullable|string|max:500',
            'is_public' => 'boolean',
        ]);

        $goal->update($request->only([
            'name', 'description', 'target_amount', 'unit', 'category',
            'end_date', 'punishment', 'is_public'
        ]));

        return redirect()->route('goals.show', $goal)
            ->with('success', 'Goal updated successfully!');
    }

    /**
     * Remove the specified goal.
     */
    public function destroy(Goal $goal)
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return redirect()->route('goals.index')
            ->with('success', 'Goal deleted successfully!');
    }

    /**
     * Add progress to a goal.
     */
    public function addProgress(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:500',
            'date' => 'required|date|before_or_equal:today',
        ]);

        GoalProgress::create([
            'id' => Str::uuid(),
            'goal_id' => $goal->id,
            'amount' => $request->amount,
            'note' => $request->note,
            'date' => $request->date,
        ]);

        // Update goal's current amount
        $goal->update([
            'current_amount' => $goal->progress()->sum('amount')
        ]);

        // Check if goal is completed
        if ($goal->current_amount >= $goal->target_amount && $goal->status !== 'completed') {
            $goal->update(['status' => 'completed']);
        }

        return back()->with('success', 'Progress added successfully!');
    }

    /**
     * Get public goals for discovery.
     */
    public function discover(Request $request)
    {
        $goals = Goal::public()
            ->with('user:id,first_name,last_name')
            ->orderBy('created_at', 'desc')
            ->paginate(12);

        return Inertia::render('Goals/Discover', [
            'goals' => $goals,
        ]);
    }
}
