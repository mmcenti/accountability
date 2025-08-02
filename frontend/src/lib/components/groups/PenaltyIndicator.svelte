<script lang="ts">
	import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/svelte/24/outline';
	import { getTotalPenalty, getPenaltyByGoal } from '$lib/stores/groups';
	import { getPenaltyDescription } from '$lib/types/groups';

	export let goalId: string | null = null;
	export let penaltyAmount: number = 0;
	export let unit: string = '';
	export let compact = false;
	export let showExplanation = true;

	$: displayPenalty = goalId ? ($getPenaltyByGoal[goalId] || 0) : penaltyAmount;
	$: totalPenalty = $getTotalPenalty;
	$: hasPenalty = displayPenalty > 0;
	$: hasAnyPenalty = totalPenalty > 0;
	
	function getPenaltyLevel(penalty: number): 'low' | 'medium' | 'high' | 'critical' {
		if (penalty <= 0) return 'low';
		if (penalty <= 5) return 'low';
		if (penalty <= 15) return 'medium';
		if (penalty <= 30) return 'high';
		return 'critical';
	}
	
	function getPenaltyColor(level: 'low' | 'medium' | 'high' | 'critical'): string {
		switch (level) {
			case 'low':
				return 'text-gray-600 bg-gray-100';
			case 'medium':
				return 'text-yellow-700 bg-yellow-100';
			case 'high':
				return 'text-orange-700 bg-orange-100';
			case 'critical':
				return 'text-red-700 bg-red-100';
		}
	}
	
	function getPenaltyMessage(penalty: number, unit: string): string {
		if (penalty <= 0) return 'No penalty';
		
		const level = getPenaltyLevel(penalty);
		const description = getPenaltyDescription(penalty, unit);
		
		switch (level) {
			case 'low':
				return `Small penalty: ${description}`;
			case 'medium':
				return `Moderate penalty: ${description}`;
			case 'high':
				return `High penalty: ${description}`;
			case 'critical':
				return `Critical penalty: ${description}`;
		}
	}
	
	$: penaltyLevel = getPenaltyLevel(displayPenalty);
	$: penaltyColor = getPenaltyColor(penaltyLevel);
	$: penaltyMessage = getPenaltyMessage(displayPenalty, unit);
	$: penaltyIcon = penaltyLevel === 'low' ? InformationCircleIcon : ExclamationTriangleIcon;
</script>

{#if hasPenalty || (!goalId && hasAnyPenalty)}
	<div 
		class="penalty-indicator"
		class:compact
		class:low={penaltyLevel === 'low'}
		class:medium={penaltyLevel === 'medium'}
		class:high={penaltyLevel === 'high'}
		class:critical={penaltyLevel === 'critical'}
	>
		<!-- Main penalty display -->
		<div class="flex items-center space-x-2">
			<svelte:component 
				this={penaltyIcon} 
				class="w-4 h-4 flex-shrink-0"
				class:text-yellow-600={penaltyLevel === 'medium'}
				class:text-orange-600={penaltyLevel === 'high'}
				class:text-red-600={penaltyLevel === 'critical'}
				class:text-gray-500={penaltyLevel === 'low'}
			/>
			
			<div class="flex-1 min-w-0">
				{#if compact}
					<span class="text-sm font-medium">{penaltyMessage}</span>
				{:else}
					<div class="space-y-1">
						<p class="text-sm font-medium">{penaltyMessage}</p>
						
						{#if showExplanation && displayPenalty > 0}
							<p class="text-xs opacity-75">
								Carry-over from missed targets in previous periods
							</p>
						{/if}
					</div>
				{/if}
			</div>
			
			<!-- Penalty badge -->
			<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium {penaltyColor}">
				+{displayPenalty} {unit}
			</span>
		</div>

		<!-- Explanation for penalty carry-over system -->
		{#if showExplanation && !compact && displayPenalty > 0}
			<div class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
				<h4 class="text-sm font-medium text-gray-900 mb-2">
					🔗 Penalty Carry-Over System
				</h4>
				<div class="text-xs text-gray-600 space-y-1">
					<p>• When you miss your weekly target, the deficit carries over to next week</p>
					<p>• This ensures accountability and prevents falling behind</p>
					<p>• Complete your target + penalty to clear your debt</p>
					<p>• The chain of accountability keeps you committed! 💪</p>
				</div>
			</div>
		{/if}

		<!-- Total penalty summary (when showing specific goal) -->
		{#if goalId && totalPenalty > displayPenalty}
			<div class="mt-2 pt-2 border-t border-gray-200">
				<p class="text-xs text-gray-600">
					Total penalties across all groups: 
					<span class="font-medium">{totalPenalty} {unit}</span>
				</p>
			</div>
		{/if}
	</div>
{:else if showExplanation && !compact}
	<!-- No penalty - show positive message -->
	<div class="penalty-indicator no-penalty">
		<div class="flex items-center space-x-2">
			<div class="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
				<span class="text-white text-xs">✓</span>
			</div>
			<span class="text-sm font-medium text-green-700">No penalties! Keep it up! 🎉</span>
		</div>
	</div>
{/if}

<style>
	.penalty-indicator {
		@apply rounded-lg p-3 border;
		transition: all 0.2s ease-in-out;
	}
	
	.penalty-indicator.compact {
		@apply p-2;
	}
	
	.penalty-indicator.low {
		@apply bg-gray-50 border-gray-200;
	}
	
	.penalty-indicator.medium {
		@apply bg-yellow-50 border-yellow-200;
		animation: gentle-pulse 3s ease-in-out infinite;
	}
	
	.penalty-indicator.high {
		@apply bg-orange-50 border-orange-200;
		animation: attention-pulse 2s ease-in-out infinite;
	}
	
	.penalty-indicator.critical {
		@apply bg-red-50 border-red-200;
		animation: urgent-pulse 1.5s ease-in-out infinite;
	}
	
	.penalty-indicator.no-penalty {
		@apply bg-green-50 border-green-200;
	}
	
	/* Animations for different penalty levels */
	@keyframes gentle-pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.8; }
	}
	
	@keyframes attention-pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		50% { opacity: 0.9; transform: scale(1.01); }
	}
	
	@keyframes urgent-pulse {
		0%, 100% { opacity: 1; transform: scale(1); }
		25% { opacity: 0.8; transform: scale(1.02); }
		75% { opacity: 0.9; transform: scale(0.99); }
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.penalty-indicator.low {
			@apply bg-gray-800 border-gray-700;
		}
		
		.penalty-indicator.medium {
			@apply bg-yellow-900 bg-opacity-20 border-yellow-700;
		}
		
		.penalty-indicator.high {
			@apply bg-orange-900 bg-opacity-20 border-orange-700;
		}
		
		.penalty-indicator.critical {
			@apply bg-red-900 bg-opacity-20 border-red-700;
		}
		
		.penalty-indicator.no-penalty {
			@apply bg-green-900 bg-opacity-20 border-green-700;
		}
		
		.bg-gray-50 {
			@apply bg-gray-800;
		}
		
		.border-gray-200 {
			@apply border-gray-700;
		}
		
		.text-gray-900 {
			@apply text-gray-100;
		}
		
		.text-gray-600 {
			@apply text-gray-400;
		}
	}
	
	/* High contrast mode */
	@media (prefers-contrast: high) {
		.penalty-indicator {
			@apply border-2;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.penalty-indicator.medium,
		.penalty-indicator.high,
		.penalty-indicator.critical {
			animation: none;
		}
	}
	
	/* Mobile optimizations */
	@media (max-width: 640px) {
		.penalty-indicator {
			@apply text-sm;
		}
		
		.penalty-indicator.compact {
			@apply p-2 text-xs;
		}
	}
</style>