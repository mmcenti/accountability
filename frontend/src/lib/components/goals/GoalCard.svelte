<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { PlusIcon, EllipsisHorizontalIcon, CheckIcon } from '@heroicons/svelte/24/outline';
	import { PlusIcon as PlusIconSolid } from '@heroicons/svelte/24/solid';
	import type { Goal } from '$lib/types/goals';
	import { 
		getCategoryConfig, 
		calculateProgressPercentage, 
		calculateDaysRemaining, 
		calculateRequiredDaily,
		getGoalStatusColor,
		isGoalOverdue 
	} from '$lib/types/goals';
	import { hapticFeedback } from '$lib/utils/gestures';
	import { format } from 'date-fns';

	export let goal: Goal;
	export let showProgress = true;
	export let showActions = true;
	export let compact = false;

	const dispatch = createEventDispatcher<{
		addProgress: { goalId: string };
		viewDetails: { goal: Goal };
		editGoal: { goal: Goal };
		completeGoal: { goalId: string };
	}>();

	$: categoryConfig = getCategoryConfig(goal.category);
	$: progressPercentage = calculateProgressPercentage(goal.current_amount, goal.target_amount);
	$: daysRemaining = calculateDaysRemaining(goal.end_date);
	$: requiredDaily = calculateRequiredDaily(goal);
	$: statusColor = getGoalStatusColor(goal);
	$: overdue = isGoalOverdue(goal);

	function handleAddProgress() {
		hapticFeedback('light');
		dispatch('addProgress', { goalId: goal.id });
	}

	function handleViewDetails() {
		hapticFeedback('light');
		dispatch('viewDetails', { goal });
	}

	function handleEdit() {
		hapticFeedback('light');
		dispatch('editGoal', { goal });
	}

	function handleComplete() {
		hapticFeedback('medium');
		dispatch('completeGoal', { goalId: goal.id });
	}

	function formatAmount(amount: number): string {
		return amount % 1 === 0 ? amount.toString() : amount.toFixed(1);
	}
</script>

<div 
	class="card goal-card"
	class:compact
	class:overdue
	role="article"
	aria-labelledby="goal-{goal.id}-title"
>
	<!-- Header -->
	<div class="flex items-start justify-between mb-3">
		<div class="flex items-center space-x-3 flex-1 min-w-0">
			<!-- Category Icon -->
			<div class="w-10 h-10 {categoryConfig.color} rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">
				{categoryConfig.icon}
			</div>
			
			<!-- Goal Info -->
			<div class="flex-1 min-w-0">
				<h3 
					id="goal-{goal.id}-title"
					class="font-semibold text-gray-900 truncate"
					class:text-sm={compact}
					class:text-base={!compact}
				>
					{goal.name}
				</h3>
				
				<!-- Status Badge -->
				<div class="flex items-center space-x-2 mt-1">
					<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {statusColor}">
						{goal.status}
					</span>
					
					{#if overdue}
						<span class="text-xs text-red-600 font-medium">Overdue</span>
					{:else if daysRemaining !== null}
						<span class="text-xs text-gray-500">
							{daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left
						</span>
					{/if}
				</div>
			</div>
		</div>

		<!-- Actions -->
		{#if showActions && (goal.status === 'active' || goal.status === 'in_progress')}
			<div class="flex items-center space-x-1 ml-2">
				<!-- Quick Add Progress -->
				<button
					class="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors min-h-touch min-w-touch"
					on:click={handleAddProgress}
					aria-label="Add progress to {goal.name}"
					title="Add progress"
				>
					<PlusIcon class="w-5 h-5" />
				</button>
				
				<!-- Complete Goal -->
				{#if progressPercentage >= 100}
					<button
						class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors min-h-touch min-w-touch"
						on:click={handleComplete}
						aria-label="Mark {goal.name} as complete"
						title="Mark complete"
					>
						<CheckIcon class="w-5 h-5" />
					</button>
				{/if}
				
				<!-- Menu -->
				<button
					class="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors min-h-touch min-w-touch"
					on:click={handleEdit}
					aria-label="Edit {goal.name}"
					title="Edit goal"
				>
					<EllipsisHorizontalIcon class="w-5 h-5" />
				</button>
			</div>
		{/if}
	</div>

	<!-- Progress Section -->
	{#if showProgress}
		<div class="space-y-3">
			<!-- Progress Bar -->
			<div class="space-y-2">
				<div class="flex justify-between text-sm">
					<span class="text-gray-600">Progress</span>
					<span class="font-medium text-gray-900">
						{formatAmount(goal.current_amount)} / {formatAmount(goal.target_amount)} {goal.unit}
					</span>
				</div>
				
				<div class="progress-bar" aria-label="Goal progress: {progressPercentage.toFixed(1)}%">
					<div 
						class="progress-bar-fill"
						class:bg-green-500={progressPercentage >= 100}
						class:bg-primary-500={progressPercentage < 100}
						style="width: {Math.min(progressPercentage, 100)}%"
					></div>
				</div>
				
				<div class="flex justify-between text-xs text-gray-500">
					<span>{progressPercentage.toFixed(1)}% complete</span>
					{#if requiredDaily > 0 && daysRemaining && daysRemaining > 0}
						<span>{formatAmount(requiredDaily)} {goal.unit}/day needed</span>
					{/if}
				</div>
			</div>

			<!-- Additional Info -->
			{#if !compact}
				<div class="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-100">
					<div class="flex items-center space-x-4">
						<span>Started {format(new Date(goal.start_date), 'MMM d')}</span>
						{#if goal.end_date}
							<span>•</span>
							<span>Ends {format(new Date(goal.end_date), 'MMM d')}</span>
						{/if}
					</div>
					
					{#if goal.punishment}
						<span class="text-orange-600 text-xs">⚠️ Penalty set</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Tap to View Details -->
	<button
		class="absolute inset-0 w-full h-full rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
		on:click={handleViewDetails}
		aria-label="View details for {goal.name}"
	>
		<span class="sr-only">View goal details</span>
	</button>
</div>

<style>
	.goal-card {
		@apply relative bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200;
		/* Touch-friendly minimum height */
		min-height: 120px;
	}
	
	.goal-card.compact {
		@apply p-3;
		min-height: 80px;
	}
	
	.goal-card.overdue {
		@apply border-red-200 bg-red-50;
	}
	
	.goal-card:active {
		@apply scale-98;
		transition: transform 0.1s ease-out;
	}

	/* Progress bar styling */
	.progress-bar {
		@apply w-full bg-gray-200 rounded-full h-2 overflow-hidden;
	}
	
	.progress-bar-fill {
		@apply h-full rounded-full transition-all duration-500 ease-out;
	}
	
	/* Ensure interactive elements are above the tap overlay */
	.goal-card button:not(.absolute) {
		@apply relative z-10;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.goal-card {
			@apply bg-gray-800 border-gray-700;
		}
		
		.goal-card.overdue {
			@apply border-red-700 bg-red-900 bg-opacity-20;
		}
		
		.progress-bar {
			@apply bg-gray-700;
		}
	}
	
	/* High contrast mode */
	@media (prefers-contrast: high) {
		.goal-card {
			@apply border-2;
		}
		
		.progress-bar {
			@apply border border-gray-400;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.goal-card,
		.progress-bar-fill {
			@apply transition-none;
		}
		
		.goal-card:active {
			@apply scale-100;
		}
	}
</style>