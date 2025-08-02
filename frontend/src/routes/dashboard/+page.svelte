<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { 
		PlusIcon, 
		TargetIcon, 
		UserGroupIcon, 
		ChartBarIcon,
		FireIcon 
	} from '@heroicons/svelte/24/outline';
	import { 
		PlusIcon as PlusIconSolid,
		TargetIcon as TargetIconSolid
	} from '@heroicons/svelte/24/solid';
	
	import { authStore, currentUser } from '$lib/stores/auth';
	import { goalsStore, activeGoals, goalStats, todaysProgress } from '$lib/stores/goals';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import GoalCard from '$lib/components/goals/GoalCard.svelte';
	import { hapticFeedback, onPullToRefresh } from '$lib/utils/gestures';
	import { formatDistanceToNow } from 'date-fns';

	let isRefreshing = false;
	let dashboardElement: HTMLElement;

	onMount(async () => {
		// Load initial data
		try {
			await goalsStore.loadGoalsWithProgress();
		} catch (error) {
			console.error('Failed to load dashboard data:', error);
		}

		// Setup pull to refresh
		if (dashboardElement) {
			onPullToRefresh(dashboardElement, async () => {
				isRefreshing = true;
				try {
					await Promise.all([
						goalsStore.loadGoalsWithProgress(),
						authStore.sync()
					]);
				} finally {
					isRefreshing = false;
				}
			});
		}
	});

	// Get greeting based on time of day
	function getGreeting(): string {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	}

	// Handle quick actions
	function handleCreateGoal() {
		hapticFeedback('medium');
		goto('/goals/create');
	}

	function handleJoinGroup() {
		hapticFeedback('medium');
		goto('/groups/join');
	}

	function handleViewAnalytics() {
		hapticFeedback('light');
		goto('/analytics');
	}

	function handleViewAllGoals() {
		hapticFeedback('light');
		goto('/goals');
	}

	// Goal event handlers
	function handleAddProgress(event: CustomEvent<{ goalId: string }>) {
		goto(`/goals/${event.detail.goalId}/progress`);
	}

	function handleViewGoalDetails(event: CustomEvent<{ goal: any }>) {
		goto(`/goals/${event.detail.goal.id}`);
	}

	function handleEditGoal(event: CustomEvent<{ goal: any }>) {
		goto(`/goals/${event.detail.goal.id}/edit`);
	}

	async function handleCompleteGoal(event: CustomEvent<{ goalId: string }>) {
		try {
			await goalsStore.completeGoal(event.detail.goalId);
		} catch (error) {
			console.error('Failed to complete goal:', error);
		}
	}

	$: greeting = getGreeting();
	$: userName = $currentUser?.first_name || 'Warrior';
	$: recentGoals = $activeGoals.slice(0, 3);
	$: hasGoals = $activeGoals.length > 0;
</script>

<svelte:head>
	<title>Dashboard - ChainForge</title>
	<meta name="description" content="Your personal goal tracking dashboard" />
</svelte:head>

<div bind:this={dashboardElement} class="min-h-screen bg-gray-50 pb-safe">
	<!-- Header -->
	<div class="bg-white border-b border-gray-200 safe-top">
		<div class="px-4 py-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold text-gray-900">
						{greeting}, {userName}! 👋
					</h1>
					<p class="text-sm text-gray-600 mt-1">
						Ready to forge your path to success?
					</p>
				</div>
				
				<!-- Profile Avatar -->
				<div class="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center">
					{#if $currentUser?.avatar}
						<img 
							src={$currentUser.avatar} 
							alt={userName}
							class="w-full h-full rounded-full object-cover"
						/>
					{:else}
						<span class="text-white font-semibold text-lg">
							{userName.charAt(0).toUpperCase()}
						</span>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="px-4 py-6 space-y-6">
		<!-- Quick Stats -->
		<div class="grid grid-cols-2 gap-4">
			<div class="bg-white rounded-xl p-4 border border-gray-200">
				<div class="flex items-center">
					<TargetIconSolid class="w-8 h-8 text-primary-600" />
					<div class="ml-3">
						<p class="text-2xl font-bold text-gray-900">{$goalStats.active}</p>
						<p class="text-sm text-gray-600">Active Goals</p>
					</div>
				</div>
			</div>
			
			<div class="bg-white rounded-xl p-4 border border-gray-200">
				<div class="flex items-center">
					<FireIcon class="w-8 h-8 text-orange-500" />
					<div class="ml-3">
						<p class="text-2xl font-bold text-gray-900">{$goalStats.completionRate}%</p>
						<p class="text-sm text-gray-600">Success Rate</p>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Actions -->
		<div class="bg-white rounded-xl p-4 border border-gray-200">
			<h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
			
			<div class="grid grid-cols-1 gap-3">
				<button
					class="flex items-center p-3 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors text-left min-h-touch"
					on:click={handleCreateGoal}
				>
					<div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
						<PlusIconSolid class="w-5 h-5 text-white" />
					</div>
					<div class="ml-3">
						<p class="font-medium text-primary-900">Create New Goal</p>
						<p class="text-sm text-primary-700">Start your next challenge</p>
					</div>
				</button>
				
				<button
					class="flex items-center p-3 bg-secondary-50 border border-secondary-200 rounded-lg hover:bg-secondary-100 transition-colors text-left min-h-touch"
					on:click={handleJoinGroup}
				>
					<div class="w-10 h-10 bg-secondary-600 rounded-lg flex items-center justify-center">
						<UserGroupIcon class="w-5 h-5 text-white" />
					</div>
					<div class="ml-3">
						<p class="font-medium text-secondary-900">Join a Group</p>
						<p class="text-sm text-secondary-700">Find accountability partners</p>
					</div>
				</button>
			</div>
		</div>

		<!-- Active Goals -->
		{#if hasGoals}
			<div class="bg-white rounded-xl p-4 border border-gray-200">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-900">Active Goals</h2>
					{#if $activeGoals.length > 3}
						<button
							class="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
							on:click={handleViewAllGoals}
						>
							View All ({$activeGoals.length})
						</button>
					{/if}
				</div>
				
				<div class="space-y-3">
					{#each recentGoals as goal (goal.id)}
						<GoalCard
							{goal}
							compact={true}
							on:addProgress={handleAddProgress}
							on:viewDetails={handleViewGoalDetails}
							on:editGoal={handleEditGoal}
							on:completeGoal={handleCompleteGoal}
						/>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Empty State -->
			<div class="bg-white rounded-xl p-8 border border-gray-200 text-center">
				<TargetIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
				<h3 class="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
				<p class="text-gray-600 mb-6">
					Start your journey by creating your first goal. Every expert was once a beginner!
				</p>
				<button
					class="btn btn-primary"
					on:click={handleCreateGoal}
				>
					<PlusIcon class="w-5 h-5 mr-2" />
					Create Your First Goal
				</button>
			</div>
		{/if}

		<!-- Today's Progress -->
		{#if $todaysProgress.length > 0}
			<div class="bg-white rounded-xl p-4 border border-gray-200">
				<h2 class="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
				
				<div class="space-y-3">
					{#each $todaysProgress as { goal, todayAmount } (goal.id)}
						{#if todayAmount > 0}
							<div class="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
								<div class="flex items-center">
									<div class="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
									<span class="font-medium text-gray-900">{goal.name}</span>
								</div>
								<span class="text-green-600 font-semibold">
									+{todayAmount} {goal.unit}
								</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>
		{/if}

		<!-- Analytics Preview -->
		{#if hasGoals}
			<div class="bg-white rounded-xl p-4 border border-gray-200">
				<div class="flex items-center justify-between mb-4">
					<h2 class="text-lg font-semibold text-gray-900">Your Progress</h2>
					<button
						class="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
						on:click={handleViewAnalytics}
					>
						View Analytics
					</button>
				</div>
				
				<div class="grid grid-cols-3 gap-4 text-center">
					<div>
						<p class="text-2xl font-bold text-gray-900">{$goalStats.total}</p>
						<p class="text-xs text-gray-600">Total Goals</p>
					</div>
					<div>
						<p class="text-2xl font-bold text-green-600">{$goalStats.completed}</p>
						<p class="text-xs text-gray-600">Completed</p>
					</div>
					<div>
						<p class="text-2xl font-bold text-primary-600">{$goalStats.active}</p>
						<p class="text-xs text-gray-600">In Progress</p>
					</div>
				</div>
			</div>
		{/if}
	</div>

	<!-- Loading Overlay -->
	{#if isRefreshing}
		<div class="fixed top-16 left-1/2 transform -translate-x-1/2 z-50">
			<LoadingIndicator size="sm" text="Refreshing..." overlay={false} />
		</div>
	{/if}
</div>

<style>
	/* Ensure smooth pull-to-refresh */
	.min-h-screen {
		position: relative;
		overflow-x: hidden;
	}
	
	/* Touch-friendly buttons */
	button {
		touch-action: manipulation;
	}
	
	/* Scale animation for button press */
	button:active {
		transform: scale(0.98);
		transition: transform 0.1s ease-out;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.bg-gray-50 {
			background: #111827;
		}
		
		.bg-white {
			background: #1F2937;
		}
		
		.border-gray-200 {
			border-color: #374151;
		}
		
		.text-gray-900 {
			color: #F9FAFB;
		}
		
		.text-gray-600 {
			color: #D1D5DB;
		}
	}
	
	/* High contrast adjustments */
	@media (prefers-contrast: high) {
		.border {
			border-width: 2px;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		button:active {
			transform: none;
		}
		
		* {
			transition: none !important;
		}
	}
</style>