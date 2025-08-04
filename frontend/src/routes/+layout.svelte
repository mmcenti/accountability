<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { authStore } from '$lib/stores/auth';
	import BottomNavigation from '$lib/components/navigation/BottomNavigation.svelte';
	import Toast from '$lib/components/ui/Toast.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import PWAPrompt from '$lib/components/ui/PWAPrompt.svelte';
	import { gestures } from '$lib/utils/gestures';

	// Check if user is authenticated
	$: isAuthenticated = $authStore.isAuthenticated;
	$: currentPath = $page.url.pathname;

	// Routes that don't need authentication
	const publicRoutes = ['/', '/login', '/register', '/forgot-password', '/reset-password', '/demo'];
	$: isPublicRoute = publicRoutes.includes(currentPath);

	// Routes that should hide bottom navigation
	const hideNavRoutes = ['/login', '/register', '/onboarding', '/demo'];
	$: shouldShowNav = isAuthenticated && !hideNavRoutes.some(route => currentPath.startsWith(route));

	onMount(() => {
		// Initialize auth store
		authStore.initialize();

		// Setup gesture handling for mobile
		if (browser) {
			// Add gesture support for swipe navigation
			const appElement = document.querySelector('main');
			if (appElement) {
				gestures.setupSwipeNavigation(appElement);
			}

			// Handle network status changes
			const updateOnlineStatus = () => {
				authStore.setNetworkStatus(navigator.onLine);
			};
			
			window.addEventListener('online', updateOnlineStatus);
			window.addEventListener('offline', updateOnlineStatus);
			
			return () => {
				window.removeEventListener('online', updateOnlineStatus);
				window.removeEventListener('offline', updateOnlineStatus);
			};
		}
	});

	// Handle back button navigation on mobile
	$: if (browser && $page.url.pathname) {
		// Update page title for better mobile experience
		const pathSegments = $page.url.pathname.split('/').filter(Boolean);
		const pageName = pathSegments[pathSegments.length - 1] || 'Dashboard';
		document.title = `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} - ChainForge`;
	}
</script>

<svelte:head>
	<!-- Dynamic meta tags based on route -->
	{#if currentPath === '/'}
		<title>ChainForge - Goal Tracking with Accountability</title>
		<meta name="description" content="Achieve your goals through personal discipline and group accountability. Join groups, track progress, and experience real peer pressure through our penalty carry-over system." />
	{:else if currentPath.startsWith('/dashboard')}
		<title>Dashboard - ChainForge</title>
		<meta name="description" content="Track your personal goals and group progress in one place." />
	{:else if currentPath.startsWith('/goals')}
		<title>Goals - ChainForge</title>
		<meta name="description" content="Manage your personal goals and track daily progress." />
	{:else if currentPath.startsWith('/groups')}
		<title>Groups - ChainForge</title>
		<meta name="description" content="Join accountability groups and compete with friends to achieve shared goals." />
	{/if}
</svelte:head>

<!-- Global loading indicator -->
{#if $authStore.isLoading}
	<LoadingIndicator />
{/if}

<!-- Main app structure -->
<div class="flex flex-col min-h-screen bg-gray-50">
	<!-- Main content area -->
	<main 
		class="flex-1 pb-16 md:pb-0 overscroll-y-none"
		class:pb-0={!shouldShowNav}
		role="main"
		id="main-content"
	>
		<!-- Page content -->
		<div class="min-h-full">
			<slot />
		</div>
	</main>

	<!-- Bottom navigation for mobile -->
	{#if shouldShowNav}
		<BottomNavigation {currentPath} />
	{/if}
</div>

<!-- Global components -->
<Toast />
<PWAPrompt />

<!-- Offline indicator -->
{#if browser && !$authStore.isOnline}
	<div 
		class="fixed top-0 left-0 right-0 bg-warning-500 text-white text-center py-2 text-sm font-medium z-50 safe-top"
		role="alert"
		aria-live="polite"
	>
		📡 You're offline. Some features may be limited.
	</div>
{/if}

<!-- Global styles for mobile optimization -->
<style>
	:global(html) {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100);
	}

	:global(body) {
		height: 100%;
		height: calc(var(--vh, 1vh) * 100);
		overflow-x: hidden;
	}

	/* Ensure touch targets are at least 44px */
	:global(button, a, input, select, textarea) {
		min-height: 44px;
	}

	/* Improve scroll performance on mobile */
	:global(*) {
		-webkit-overflow-scrolling: touch;
	}

	/* Hide scrollbar on mobile while keeping functionality */
	:global(.hide-scrollbar) {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}

	:global(.hide-scrollbar::-webkit-scrollbar) {
		display: none;
	}

	/* Focus styles for accessibility */
	:global(:focus-visible) {
		outline: 2px solid theme('colors.primary.500');
		outline-offset: 2px;
	}

	/* Reduce motion for users who prefer it */
	@media (prefers-reduced-motion: reduce) {
		:global(*) {
			animation-duration: 0.01ms !important;
			animation-iteration-count: 1 !important;
			transition-duration: 0.01ms !important;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		:global(.card) {
			border-width: 2px;
		}
	}

	/* Dark mode adjustments */
	@media (prefers-color-scheme: dark) {
		:global(.bg-gray-50) {
			background-color: theme('colors.gray.900');
		}
		
		:global(.text-gray-900) {
			color: theme('colors.gray.100');
		}
	}
</style>