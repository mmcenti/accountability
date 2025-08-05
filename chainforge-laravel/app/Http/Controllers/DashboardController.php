<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Show the dashboard.
     */
    public function index(Request $request)
    {
        $user = $request->user()->load([
            'subscription',
            'goals' => function ($query) {
                $query->where('status', 'active')
                      ->orderBy('created_at', 'desc')
                      ->with('progress');
            },
            'groups' => function ($query) {
                $query->wherePivot('is_active', true)
                      ->with(['goals' => function ($goalQuery) {
                          $goalQuery->where('is_active', true);
                      }]);
            }
        ]);

        // Calculate stats
        $stats = [
            'total_goals' => $user->goals->count(),
            'completed_goals' => $user->goals->where('is_completed', true)->count(),
            'active_groups' => $user->groups->count(),
            'completion_rate' => $user->goals->count() > 0 
                ? round(($user->goals->where('is_completed', true)->count() / $user->goals->count()) * 100, 1)
                : 0,
        ];

        return Inertia::render('Dashboard/Index', [
            'user' => $user,
            'stats' => $stats,
        ]);
    }
}
