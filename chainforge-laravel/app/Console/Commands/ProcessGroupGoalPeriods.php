<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\GroupGoalPeriod;
use App\Models\GroupGoalProgress;
use Illuminate\Support\Str;

class ProcessGroupGoalPeriods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chainforge:process-periods {--dry-run : Show what would be processed without making changes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process group goal periods, handle transitions and penalty carry-over';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $dryRun = $this->option('dry-run');
        
        if ($dryRun) {
            $this->info('🔍 Running in dry-run mode - no changes will be made');
        }

        $this->info('🚀 Processing group goal periods...');

        // Process ended periods
        $endedPeriods = GroupGoalPeriod::where('is_active', true)
            ->where('end_date', '<', now())
            ->with(['groupGoal', 'progress.user'])
            ->get();

        if ($endedPeriods->isEmpty()) {
            $this->info('✅ No periods to process');
            return;
        }

        $this->info("📋 Found {$endedPeriods->count()} periods to process");

        foreach ($endedPeriods as $period) {
            $this->processEndedPeriod($period, $dryRun);
        }

        $this->info('🎉 Period processing completed!');
    }

    /**
     * Process an ended period.
     */
    private function processEndedPeriod(GroupGoalPeriod $period, bool $dryRun): void
    {
        $goal = $period->groupGoal;
        $this->line("🎯 Processing period for goal: {$goal->name}");

        // Close the current period
        if (!$dryRun) {
            $period->update(['is_active' => false]);
        }
        $this->info("   ⏹️  Closed period: {$period->start_date->format('M j')} - {$period->end_date->format('M j, Y')}");

        // Calculate penalties for failed participants
        $failedProgress = $period->progress->filter(function ($progress) {
            return $progress->has_failed;
        });

        $penaltyCarryOvers = [];
        foreach ($failedProgress as $progress) {
            $penalty = $progress->calculatePenalty();
            if ($penalty > 0) {
                $penaltyCarryOvers[$progress->user_id] = $penalty;
                $this->warn("   ⚠️  {$progress->user->full_name} missed target by {$penalty} {$goal->unit} - penalty carries over");
            }
        }

        // Create next period
        $nextStartDate = $period->end_date->copy()->addDay();
        $nextEndDate = $goal->period_type === 'weekly' 
            ? $nextStartDate->copy()->addWeek() 
            : $nextStartDate->copy()->addMonth();

        if (!$dryRun) {
            $nextPeriod = GroupGoalPeriod::create([
                'id' => Str::uuid(),
                'group_goal_id' => $goal->id,
                'start_date' => $nextStartDate,
                'end_date' => $nextEndDate,
            ]);

            // Apply penalty carry-overs to next period
            foreach ($penaltyCarryOvers as $userId => $penalty) {
                // Find existing progress or create new one
                $existingProgress = GroupGoalProgress::where('group_goal_period_id', $nextPeriod->id)
                    ->where('user_id', $userId)
                    ->first();

                if ($existingProgress) {
                    $existingProgress->update([
                        'penalty_carry_over' => $existingProgress->penalty_carry_over + $penalty
                    ]);
                } else {
                    GroupGoalProgress::create([
                        'id' => Str::uuid(),
                        'group_goal_period_id' => $nextPeriod->id,
                        'user_id' => $userId,
                        'target_amount' => 0, // User will set their target
                        'penalty_carry_over' => $penalty,
                    ]);
                }
            }

            $this->info("   ▶️  Created next period: {$nextStartDate->format('M j')} - {$nextEndDate->format('M j, Y')}");
        } else {
            $this->info("   ▶️  Would create next period: {$nextStartDate->format('M j')} - {$nextEndDate->format('M j, Y')}");
        }

        // Show completion stats
        $totalParticipants = $period->progress->count();
        $completedCount = $period->progress->where('is_completed', true)->count();
        $completionRate = $totalParticipants > 0 ? round(($completedCount / $totalParticipants) * 100, 1) : 0;

        $this->info("   📊 Period stats: {$completedCount}/{$totalParticipants} completed ({$completionRate}%)");

        if ($penaltyCarryOvers) {
            $totalPenalty = array_sum($penaltyCarryOvers);
            $this->info("   💸 Total penalty carry-over: {$totalPenalty} {$goal->unit}");
        }

        $this->line('');
    }
}
