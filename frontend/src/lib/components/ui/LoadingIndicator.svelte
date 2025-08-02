<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
	export let text: string = 'Loading...';
	export let overlay: boolean = true;
	export let color: 'primary' | 'secondary' | 'white' = 'primary';

	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
		xl: 'w-16 h-16'
	};

	const colorClasses = {
		primary: 'text-primary-600',
		secondary: 'text-secondary-600',
		white: 'text-white'
	};
</script>

{#if overlay}
	<!-- Full screen overlay -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
		role="status"
		aria-live="polite"
		aria-label={text}
	>
		<div class="bg-white rounded-lg p-6 flex flex-col items-center space-y-3 mx-4 min-w-32">
			<!-- Spinner -->
			<div class="relative {sizeClasses[size]}">
				<div class="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
				<div class="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
			</div>
			
			<!-- Text -->
			<p class="text-sm font-medium text-gray-600 text-center">{text}</p>
		</div>
	</div>
{:else}
	<!-- Inline spinner -->
	<div 
		class="flex items-center justify-center space-x-2"
		role="status"
		aria-live="polite"
		aria-label={text}
	>
		<!-- Spinner -->
		<div class="relative {sizeClasses[size]} {colorClasses[color]}">
			<div class="absolute inset-0 border-2 border-current opacity-20 rounded-full"></div>
			<div class="absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin"></div>
		</div>
		
		<!-- Text (optional) -->
		{#if text}
			<span class="text-sm font-medium {colorClasses[color]}">{text}</span>
		{/if}
	</div>
{/if}

<style>
	/* Optimized animation for mobile performance */
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
	
	/* Reduce motion for accessibility */
	@media (prefers-reduced-motion: reduce) {
		.animate-spin {
			animation: spin 3s linear infinite;
		}
	}
</style>