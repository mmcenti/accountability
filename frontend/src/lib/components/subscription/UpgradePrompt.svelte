<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { 
		SparklesIcon, 
		XMarkIcon, 
		StarIcon, 
		CheckIcon,
		UserGroupIcon,
		ChartBarIcon,
		TargetIcon
	} from '@heroicons/svelte/24/outline';
	import { SparklesIcon as SparklesIconSolid } from '@heroicons/svelte/24/solid';
	import { subscriptionStore, isSubscriptionPremium } from '$lib/stores/subscription';
	import { SUBSCRIPTION_PLANS, getPlanPrice } from '$lib/types/subscription';
	import { hapticFeedback } from '$lib/utils/gestures';

	export let feature: string = '';
	export let message: string = '';
	export let compact = false;
	export let showDismiss = true;
	export let autoShow = true;

	const dispatch = createEventDispatcher<{
		upgrade: void;
		dismiss: void;
	}>();

	let showPrompt = autoShow;

	$: if ($isSubscriptionPremium) {
		showPrompt = false;
	}

	const featureIcons: Record<string, any> = {
		groups: UserGroupIcon,
		analytics: ChartBarIcon,
		unlimited_goals: TargetIcon,
		export: ChartBarIcon,
		api: ChartBarIcon,
		support: SparklesIcon
	};

	const featureMessages: Record<string, string> = {
		groups: 'Join accountability groups with Premium! 🤝',
		analytics: 'Get detailed analytics with Premium! 📊',
		unlimited_goals: 'Create unlimited goals with Premium! 🎯',
		export: 'Export your data with Premium! 📥',
		api: 'Access our API with Premium! 🔌',
		support: 'Get priority support with Premium! 💬'
	};

	$: displayMessage = message || featureMessages[feature] || 'Upgrade to Premium for more features! ✨';
	$: FeatureIcon = featureIcons[feature] || SparklesIcon;
	$: premiumPlan = SUBSCRIPTION_PLANS.premium;
	$: premiumPrice = getPlanPrice('premium');

	function handleUpgrade() {
		hapticFeedback('medium');
		dispatch('upgrade');
	}

	function handleDismiss() {
		hapticFeedback('light');
		showPrompt = false;
		dispatch('dismiss');
	}

	// Key features to highlight
	const keyFeatures = [
		{ icon: UserGroupIcon, text: 'Join accountability groups' },
		{ icon: TargetIcon, text: 'Unlimited personal goals' },
		{ icon: ChartBarIcon, text: 'Advanced analytics & insights' },
		{ icon: SparklesIcon, text: 'Priority support' }
	];
</script>

{#if showPrompt}
	<div 
		class="upgrade-prompt"
		class:compact
		role="dialog"
		aria-labelledby="upgrade-prompt-title"
		aria-describedby="upgrade-prompt-description"
	>
		{#if showDismiss}
			<button
				class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-white hover:bg-opacity-50 transition-colors z-10"
				on:click={handleDismiss}
				aria-label="Dismiss upgrade prompt"
			>
				<XMarkIcon class="w-4 h-4" />
			</button>
		{/if}

		{#if compact}
			<!-- Compact version for inline prompts -->
			<div class="flex items-center space-x-3 p-3">
				<div class="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
					<SparklesIconSolid class="w-5 h-5 text-white" />
				</div>
				
				<div class="flex-1 min-w-0">
					<p class="text-sm font-medium text-gray-900">{displayMessage}</p>
					<p class="text-xs text-gray-600">Starting at {premiumPrice}</p>
				</div>
				
				<button
					class="btn btn-primary btn-sm"
					on:click={handleUpgrade}
				>
					Upgrade
				</button>
			</div>
		{:else}
			<!-- Full version for modals/dedicated sections -->
			<div class="p-6 text-center">
				<!-- Header -->
				<div class="mb-4">
					<div class="w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
						<SparklesIconSolid class="w-8 h-8 text-white" />
					</div>
					
					<h3 id="upgrade-prompt-title" class="text-xl font-bold text-gray-900 mb-2">
						Unlock Premium Features
					</h3>
					
					<p id="upgrade-prompt-description" class="text-gray-600">
						{displayMessage}
					</p>
				</div>

				<!-- Features List -->
				<div class="space-y-3 mb-6">
					{#each keyFeatures as feature}
						<div class="flex items-center text-left">
							<div class="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
								<CheckIcon class="w-4 h-4 text-green-600" />
							</div>
							<span class="text-sm text-gray-700">{feature.text}</span>
						</div>
					{/each}
				</div>

				<!-- Pricing -->
				<div class="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-lg p-4 mb-6">
					<div class="flex items-center justify-center">
						<StarIcon class="w-5 h-5 text-yellow-500 mr-2" />
						<span class="text-lg font-bold text-gray-900">
							Only {premiumPrice}
						</span>
					</div>
					<p class="text-sm text-gray-600 mt-1">
						30-day free trial • Cancel anytime
					</p>
				</div>

				<!-- Actions -->
				<div class="space-y-3">
					<button
						class="btn btn-primary w-full"
						on:click={handleUpgrade}
					>
						<SparklesIconSolid class="w-5 h-5 mr-2" />
						Start Free Trial
					</button>
					
					{#if showDismiss}
						<button
							class="text-sm text-gray-600 hover:text-gray-800 transition-colors"
							on:click={handleDismiss}
						>
							Maybe later
						</button>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Trial indicator -->
		<div class="absolute top-3 left-3">
			<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
				Free Trial
			</span>
		</div>
	</div>
{/if}

<style>
	.upgrade-prompt {
		@apply relative bg-white rounded-xl border-2 border-primary-200 shadow-lg overflow-hidden;
		background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
	}
	
	.upgrade-prompt.compact {
		@apply border border-primary-200 shadow-sm;
	}
	
	.upgrade-prompt::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4px;
		background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
	}
	
	/* Animated sparkles */
	.upgrade-prompt:not(.compact)::after {
		content: '✨';
		position: absolute;
		top: 20px;
		right: 20px;
		font-size: 20px;
		animation: sparkle 3s ease-in-out infinite;
	}
	
	@keyframes sparkle {
		0%, 100% { 
			opacity: 0.4; 
			transform: scale(1) rotate(0deg);
		}
		50% { 
			opacity: 1; 
			transform: scale(1.2) rotate(180deg);
		}
	}
	
	/* Button hover effects */
	.btn:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}
	
	.btn:active {
		transform: translateY(0);
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.upgrade-prompt {
			@apply bg-gray-800 border-primary-700;
			background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
		}
		
		.upgrade-prompt.compact {
			@apply border-primary-700;
		}
		
		.text-gray-900 {
			@apply text-gray-100;
		}
		
		.text-gray-600 {
			@apply text-gray-400;
		}
		
		.text-gray-700 {
			@apply text-gray-300;
		}
		
		.bg-gradient-to-r.from-primary-50.to-secondary-50 {
			@apply from-primary-900 to-secondary-900;
			background-opacity: 0.3;
		}
	}
	
	/* High contrast mode */
	@media (prefers-contrast: high) {
		.upgrade-prompt {
			@apply border-4;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.upgrade-prompt::after {
			animation: none;
		}
		
		.btn:hover {
			transform: none;
		}
		
		* {
			transition: none !important;
		}
	}
	
	/* Mobile optimizations */
	@media (max-width: 640px) {
		.upgrade-prompt:not(.compact) {
			@apply mx-4;
		}
		
		.upgrade-prompt {
			@apply text-sm;
		}
	}
</style>