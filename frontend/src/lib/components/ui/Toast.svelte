<script lang="ts">
	import { Toaster } from 'svelte-french-toast';
</script>

<!-- Toast container with mobile-optimized positioning -->
<Toaster
	position="top-center"
	reverseOrder={false}
	gutter={8}
	containerClassName="toast-container"
	toastOptions={{
		// Default options for all toasts
		duration: 4000,
		style: 'background: white; color: #374151; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #E5E7EB; padding: 12px 16px; font-size: 14px; font-weight: 500; max-width: calc(100vw - 32px);',
		
		// Success toast styling
		success: {
			duration: 3000,
			style: 'background: #F0FDF4; color: #166534; border-color: #BBF7D0;',
			iconTheme: {
				primary: '#22C55E',
				secondary: '#F0FDF4'
			}
		},
		
		// Error toast styling
		error: {
			duration: 5000,
			style: 'background: #FEF2F2; color: #991B1B; border-color: #FECACA;',
			iconTheme: {
				primary: '#EF4444',
				secondary: '#FEF2F2'
			}
		},
		
		// Loading toast styling
		loading: {
			duration: Infinity,
			style: 'background: #EFF6FF; color: #1E40AF; border-color: #BFDBFE;',
			iconTheme: {
				primary: '#3B82F6',
				secondary: '#EFF6FF'
			}
		}
	}}
/>

<style>
	:global(.toast-container) {
		/* Ensure toasts appear above navigation */
		z-index: 60;
		
		/* Safe area handling for mobile */
		top: env(safe-area-inset-top, 16px) !important;
		left: 16px;
		right: 16px;
	}
	
	/* Toast animations optimized for mobile */
	:global([data-sonner-toast]) {
		/* Slide in from top with bounce */
		animation: slideInBounce 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
		
		/* Touch-friendly minimum height */
		min-height: 48px;
		
		/* Ensure readable text */
		line-height: 1.4;
		
		/* Better touch targets for action buttons */
		--toast-button-padding: 8px 12px;
	}
	
	:global([data-sonner-toast][data-y-position="top"]) {
		/* Top positioned toasts */
		animation: slideInTop 0.3s ease-out;
	}
	
	:global([data-sonner-toast][data-removed="true"]) {
		/* Exit animation */
		animation: slideOutTop 0.2s ease-in forwards;
	}
	
	/* Custom animations */
	@keyframes slideInBounce {
		0% {
			transform: translateY(-100%) scale(0.95);
			opacity: 0;
		}
		60% {
			transform: translateY(0) scale(1.02);
			opacity: 1;
		}
		100% {
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}
	
	@keyframes slideInTop {
		from {
			transform: translateY(-100%);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
	
	@keyframes slideOutTop {
		to {
			transform: translateY(-100%);
			opacity: 0;
		}
	}
	
	/* Dark mode support */
	@media (prefers-color-scheme: dark) {
		:global([data-sonner-toast]) {
			background: #1F2937 !important;
			color: #F9FAFB !important;
			border-color: #374151 !important;
		}
		
		:global([data-sonner-toast][data-type="success"]) {
			background: #064E3B !important;
			color: #A7F3D0 !important;
			border-color: #047857 !important;
		}
		
		:global([data-sonner-toast][data-type="error"]) {
			background: #7F1D1D !important;
			color: #FCA5A5 !important;
			border-color: #DC2626 !important;
		}
		
		:global([data-sonner-toast][data-type="loading"]) {
			background: #1E3A8A !important;
			color: #BFDBFE !important;
			border-color: #3B82F6 !important;
		}
	}
	
	/* High contrast mode */
	@media (prefers-contrast: high) {
		:global([data-sonner-toast]) {
			border-width: 2px !important;
			font-weight: 600 !important;
		}
	}
	
	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		:global([data-sonner-toast]) {
			animation: fadeIn 0.2s ease-out !important;
		}
		
		:global([data-sonner-toast][data-removed="true"]) {
			animation: fadeOut 0.2s ease-in forwards !important;
		}
		
		@keyframes fadeIn {
			from { opacity: 0; }
			to { opacity: 1; }
		}
		
		@keyframes fadeOut {
			to { opacity: 0; }
		}
	}
	
	/* Landscape orientation adjustments */
	@media (orientation: landscape) and (max-height: 500px) {
		:global(.toast-container) {
			top: 8px !important;
		}
		
		:global([data-sonner-toast]) {
			min-height: 40px;
			font-size: 13px;
		}
	}
</style>