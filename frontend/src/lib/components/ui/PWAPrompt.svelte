<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/svelte/24/outline';
	import { hapticFeedback } from '$lib/utils/gestures';

	let showPrompt = false;
	let deferredPrompt: any = null;
	let isIOS = false;
	let isInStandaloneMode = false;

	onMount(() => {
		if (!browser) return;

		// Check if running in standalone mode (already installed)
		isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
			(window.navigator as any).standalone === true;

		// Check if iOS
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

		// Don't show prompt if already installed
		if (isInStandaloneMode) return;

		// Listen for beforeinstallprompt event (Android/Chrome)
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			deferredPrompt = e;
			
			// Check if user has previously dismissed the prompt
			const dismissed = localStorage.getItem('pwa-prompt-dismissed');
			const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time');
			
			// Show prompt again after 7 days
			if (!dismissed || (dismissedTime && Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
				setTimeout(() => {
					showPrompt = true;
				}, 3000); // Show after 3 seconds
			}
		});

		// For iOS, show custom prompt after some time
		if (isIOS && !isInStandaloneMode) {
			const dismissed = localStorage.getItem('pwa-prompt-dismissed-ios');
			const dismissedTime = localStorage.getItem('pwa-prompt-dismissed-time-ios');
			
			if (!dismissed || (dismissedTime && Date.now() - parseInt(dismissedTime) > 7 * 24 * 60 * 60 * 1000)) {
				setTimeout(() => {
					showPrompt = true;
				}, 5000); // Show after 5 seconds on iOS
			}
		}
	});

	async function installPWA() {
		hapticFeedback('medium');
		
		if (deferredPrompt) {
			// Android/Chrome installation
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			
			if (outcome === 'accepted') {
				console.log('PWA installation accepted');
			}
			
			deferredPrompt = null;
			showPrompt = false;
		} else if (isIOS) {
			// iOS - just hide the prompt, user will follow manual instructions
			showPrompt = false;
		}
	}

	function dismissPrompt(permanent = false) {
		hapticFeedback('light');
		showPrompt = false;
		
		if (permanent) {
			const storageKey = isIOS ? 'pwa-prompt-dismissed-ios' : 'pwa-prompt-dismissed';
			const timeKey = isIOS ? 'pwa-prompt-dismissed-time-ios' : 'pwa-prompt-dismissed-time';
			
			localStorage.setItem(storageKey, 'true');
			localStorage.setItem(timeKey, Date.now().toString());
		}
	}
</script>

{#if showPrompt}
	<!-- PWA Installation Prompt -->
	<div 
		class="fixed bottom-20 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-50 animate-slide-up"
		role="dialog"
		aria-labelledby="pwa-prompt-title"
		aria-describedby="pwa-prompt-description"
	>
		<!-- Close button -->
		<button
			class="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
			on:click={() => dismissPrompt(false)}
			aria-label="Close prompt"
		>
			<XMarkIcon class="w-5 h-5" />
		</button>

		<!-- Content -->
		<div class="pr-8">
			<!-- Icon and title -->
			<div class="flex items-center space-x-3 mb-3">
				<div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
					<span class="text-2xl">🔗⚒️</span>
				</div>
				<div>
					<h3 id="pwa-prompt-title" class="font-semibold text-gray-900">
						Install ChainForge
					</h3>
					<p class="text-sm text-gray-600">
						Get the full app experience
					</p>
				</div>
			</div>

			<!-- Description -->
			<p id="pwa-prompt-description" class="text-sm text-gray-600 mb-4">
				{#if isIOS}
					Add ChainForge to your home screen for quick access and a native app experience.
				{:else}
					Install ChainForge for faster loading, offline access, and a native app experience.
				{/if}
			</p>

			{#if isIOS}
				<!-- iOS Installation Instructions -->
				<div class="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
					<p class="font-medium text-gray-700 mb-2">To install:</p>
					<ol class="text-gray-600 space-y-1">
						<li class="flex items-center">
							<span class="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">1</span>
							Tap the share button <span class="mx-1">📤</span> in Safari
						</li>
						<li class="flex items-center">
							<span class="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">2</span>
							Select "Add to Home Screen"
						</li>
						<li class="flex items-center">
							<span class="w-5 h-5 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-2">3</span>
							Tap "Add" to confirm
						</li>
					</ol>
				</div>
			{/if}

			<!-- Action buttons -->
			<div class="flex space-x-3">
				{#if !isIOS}
					<button
						class="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium flex items-center justify-center space-x-2 hover:bg-primary-700 transition-colors"
						on:click={installPWA}
					>
						<ArrowDownTrayIcon class="w-4 h-4" />
						<span>Install</span>
					</button>
				{/if}
				
				<button
					class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
					on:click={() => dismissPrompt(true)}
				>
					{isIOS ? 'Got it' : 'Not now'}
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	@keyframes slide-up {
		from {
			transform: translateY(100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	.animate-slide-up {
		animation: slide-up 0.3s ease-out;
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		.fixed {
			background: #1F2937;
			border-color: #374151;
			color: #F9FAFB;
		}
		
		.bg-gray-50 {
			background: #374151;
		}
		
		.text-gray-900 {
			color: #F9FAFB;
		}
		
		.text-gray-600 {
			color: #D1D5DB;
		}
		
		.text-gray-700 {
			color: #E5E7EB;
		}
	}
	
	/* High contrast mode */
	@media (prefers-contrast: high) {
		.fixed {
			border-width: 2px;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.animate-slide-up {
			animation: fade-in 0.2s ease-out;
		}
		
		@keyframes fade-in {
			from { opacity: 0; }
			to { opacity: 1; }
		}
	}
</style>