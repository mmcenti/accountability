<script lang="ts">
	import { page } from '$app/stores';
	import { HomeIcon, TargetIcon, UserGroupIcon, UserIcon, ChartBarIcon } from '@heroicons/svelte/24/outline';
	import { HomeIcon as HomeIconSolid, TargetIcon as TargetIconSolid, UserGroupIcon as UserGroupIconSolid, UserIcon as UserIconSolid, ChartBarIcon as ChartBarIconSolid } from '@heroicons/svelte/24/solid';
	import { hapticFeedback } from '$lib/utils/gestures';

	export let currentPath: string;

	interface NavItem {
		id: string;
		label: string;
		href: string;
		icon: any;
		iconSolid: any;
		badge?: number;
	}

	const navItems: NavItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			href: '/dashboard',
			icon: HomeIcon,
			iconSolid: HomeIconSolid
		},
		{
			id: 'goals',
			label: 'Goals',
			href: '/goals',
			icon: TargetIcon,
			iconSolid: TargetIconSolid
		},
		{
			id: 'groups',
			label: 'Groups',
			href: '/groups',
			icon: UserGroupIcon,
			iconSolid: UserGroupIconSolid
		},
		{
			id: 'analytics',
			label: 'Analytics',
			href: '/analytics',
			icon: ChartBarIcon,
			iconSolid: ChartBarIconSolid
		},
		{
			id: 'profile',
			label: 'Profile',
			href: '/profile',
			icon: UserIcon,
			iconSolid: UserIconSolid
		}
	];

	// Check if a nav item is active
	function isActive(href: string): boolean {
		if (href === '/dashboard') {
			return currentPath === '/dashboard' || currentPath === '/';
		}
		return currentPath.startsWith(href);
	}

	// Handle navigation with haptic feedback
	function handleNavigation() {
		hapticFeedback('light');
	}
</script>

<!-- Bottom Navigation -->
<nav 
	class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-50 no-print"
	role="navigation"
	aria-label="Bottom navigation"
>
	<div class="flex justify-around items-center px-2 pt-2 pb-1">
		{#each navItems as item}
			{@const active = isActive(item.href)}
			<a
				href={item.href}
				class="nav-item min-h-touch min-w-touch relative"
				class:nav-item-active={active}
				class:nav-item-inactive={!active}
				on:click={handleNavigation}
				aria-label={item.label}
				aria-current={active ? 'page' : undefined}
			>
				<!-- Icon -->
				<div class="w-6 h-6 mx-auto mb-1 transition-transform duration-200" class:scale-110={active}>
					{#if active}
						<svelte:component this={item.iconSolid} class="w-full h-full" />
					{:else}
						<svelte:component this={item.icon} class="w-full h-full" />
					{/if}
				</div>
				
				<!-- Label -->
				<span class="text-xs leading-tight">{item.label}</span>
				
				<!-- Badge (if any) -->
				{#if item.badge}
					<div class="absolute -top-1 -right-1 bg-error-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
						{item.badge > 99 ? '99+' : item.badge}
					</div>
				{/if}
				
				<!-- Active indicator -->
				{#if active}
					<div class="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary-600 rounded-full"></div>
				{/if}
			</a>
		{/each}
	</div>
	
	<!-- iOS-style home indicator -->
	<div class="flex justify-center pb-1">
		<div class="w-32 h-1 bg-gray-300 rounded-full opacity-50"></div>
	</div>
</nav>

<style>
	/* Ensure consistent touch target sizes */
	.nav-item {
		@apply flex flex-col items-center justify-center p-2 text-xs font-medium transition-all duration-200 rounded-lg mx-1;
		min-height: 56px; /* Larger than standard 44px for better thumb access */
		min-width: 56px;
		touch-action: manipulation;
	}
	
	/* Active state with enhanced visual feedback */
	.nav-item-active {
		@apply text-primary-600 bg-primary-50;
	}
	
	/* Inactive state */
	.nav-item-inactive {
		@apply text-gray-400 hover:text-gray-600 hover:bg-gray-50;
	}
	
	/* Tap feedback */
	.nav-item:active {
		@apply scale-95;
		transition: transform 0.1s ease-out;
	}
	
	/* Focus styles for accessibility */
	.nav-item:focus-visible {
		@apply outline-none ring-2 ring-primary-500 ring-offset-2;
	}
	
	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.nav-item-active {
			@apply border-2 border-primary-600;
		}
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		nav {
			@apply bg-gray-900 border-gray-700;
		}
		
		.nav-item-active {
			@apply text-primary-400 bg-primary-900;
		}
		
		.nav-item-inactive {
			@apply text-gray-500 hover:text-gray-300 hover:bg-gray-800;
		}
	}
	
	/* Landscape orientation adjustments */
	@media (orientation: landscape) and (max-height: 500px) {
		.nav-item {
			@apply p-1;
			min-height: 48px;
			min-width: 48px;
		}
		
		.nav-item span {
			@apply text-xs;
		}
	}
	
	/* Animation for smooth transitions */
	nav {
		animation: slideUpNav 0.3s ease-out;
	}
	
	@keyframes slideUpNav {
		from {
			transform: translateY(100%);
		}
		to {
			transform: translateY(0);
		}
	}
</style>