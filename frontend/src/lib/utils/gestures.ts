import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import Hammer from 'hammer.js';

export interface SwipeConfig {
	threshold?: number;
	velocity?: number;
	direction?: number;
	onSwipeLeft?: () => void;
	onSwipeRight?: () => void;
	onSwipeUp?: () => void;
	onSwipeDown?: () => void;
}

export interface GestureManager {
	destroy: () => void;
}

class GestureHandler {
	private hammers: Map<HTMLElement, HammerManager> = new Map();

	// Setup swipe navigation for the main app
	setupSwipeNavigation(element: HTMLElement): GestureManager {
		if (!browser) {
			return { destroy: () => {} };
		}

		const hammer = new Hammer(element, {
			recognizers: [
				[Hammer.Swipe, { direction: Hammer.DIRECTION_HORIZONTAL }]
			]
		});

		// Configure swipe settings
		hammer.get('swipe').set({
			threshold: 100,
			velocity: 0.3
		});

		// Handle navigation swipes
		hammer.on('swipeleft', () => {
			// Navigate to next page in mobile flow
			this.handleNavigationSwipe('left');
		});

		hammer.on('swiperight', () => {
			// Navigate to previous page or go back
			this.handleNavigationSwipe('right');
		});

		this.hammers.set(element, hammer);

		return {
			destroy: () => {
				hammer.destroy();
				this.hammers.delete(element);
			}
		};
	}

	// Setup custom swipe handlers for specific elements
	setupSwipeHandler(element: HTMLElement, config: SwipeConfig): GestureManager {
		if (!browser) {
			return { destroy: () => {} };
		}

		const hammer = new Hammer(element);
		
		// Configure recognizers based on config
		const recognizers: any[] = [];
		
		if (config.onSwipeLeft || config.onSwipeRight) {
			recognizers.push([Hammer.Swipe, { 
				direction: Hammer.DIRECTION_HORIZONTAL,
				threshold: config.threshold || 50,
				velocity: config.velocity || 0.3
			}]);
		}
		
		if (config.onSwipeUp || config.onSwipeDown) {
			recognizers.push([Hammer.Swipe, { 
				direction: Hammer.DIRECTION_VERTICAL,
				threshold: config.threshold || 50,
				velocity: config.velocity || 0.3
			}]);
		}

		if (recognizers.length > 0) {
			hammer.get('swipe').set({
				direction: config.direction || Hammer.DIRECTION_ALL,
				threshold: config.threshold || 50,
				velocity: config.velocity || 0.3
			});
		}

		// Setup event handlers
		if (config.onSwipeLeft) {
			hammer.on('swipeleft', config.onSwipeLeft);
		}
		
		if (config.onSwipeRight) {
			hammer.on('swiperight', config.onSwipeRight);
		}
		
		if (config.onSwipeUp) {
			hammer.on('swipeup', config.onSwipeUp);
		}
		
		if (config.onSwipeDown) {
			hammer.on('swipedown', config.onSwipeDown);
		}

		this.hammers.set(element, hammer);

		return {
			destroy: () => {
				hammer.destroy();
				this.hammers.delete(element);
			}
		};
	}

	// Setup pull to refresh
	setupPullToRefresh(element: HTMLElement, onRefresh: () => Promise<void>): GestureManager {
		if (!browser) {
			return { destroy: () => {} };
		}

		let isRefreshing = false;
		let startY = 0;
		let currentY = 0;
		let isDragging = false;

		const threshold = 80;
		const refreshIndicator = this.createRefreshIndicator();
		element.parentNode?.insertBefore(refreshIndicator, element);

		const hammer = new Hammer(element);
		hammer.get('pan').set({ direction: Hammer.DIRECTION_DOWN });

		hammer.on('panstart', (e) => {
			if (element.scrollTop === 0 && e.direction === Hammer.DIRECTION_DOWN) {
				isDragging = true;
				startY = e.center.y;
			}
		});

		hammer.on('panmove', (e) => {
			if (!isDragging || isRefreshing) return;

			currentY = e.center.y - startY;
			if (currentY > 0) {
				const progress = Math.min(currentY / threshold, 1);
				this.updateRefreshIndicator(refreshIndicator, progress, currentY >= threshold);
				
				// Add elastic resistance
				const resistance = currentY > threshold ? 0.5 : 1;
				element.style.transform = `translateY(${currentY * resistance}px)`;
			}
		});

		hammer.on('panend', async (e) => {
			if (!isDragging) return;

			isDragging = false;
			
			if (currentY >= threshold && !isRefreshing) {
				isRefreshing = true;
				this.showRefreshIndicator(refreshIndicator, true);
				
				try {
					await onRefresh();
				} finally {
					isRefreshing = false;
					this.hideRefreshIndicator(refreshIndicator);
				}
			}
			
			// Reset position
			element.style.transform = '';
			currentY = 0;
		});

		this.hammers.set(element, hammer);

		return {
			destroy: () => {
				hammer.destroy();
				this.hammers.delete(element);
				refreshIndicator.remove();
			}
		};
	}

	// Setup long press handler
	setupLongPress(element: HTMLElement, onLongPress: (event: HammerInput) => void): GestureManager {
		if (!browser) {
			return { destroy: () => {} };
		}

		const hammer = new Hammer(element);
		hammer.get('press').set({ time: 500 });
		hammer.on('press', onLongPress);

		this.hammers.set(element, hammer);

		return {
			destroy: () => {
				hammer.destroy();
				this.hammers.delete(element);
			}
		};
	}

	// Handle navigation swipes
	private handleNavigationSwipe(direction: 'left' | 'right') {
		const currentPath = window.location.pathname;
		
		// Define navigation flow
		const navFlow = [
			'/dashboard',
			'/goals',
			'/groups',
			'/profile'
		];
		
		const currentIndex = navFlow.indexOf(currentPath);
		
		if (currentIndex === -1) return;
		
		if (direction === 'left' && currentIndex < navFlow.length - 1) {
			goto(navFlow[currentIndex + 1]);
		} else if (direction === 'right' && currentIndex > 0) {
			goto(navFlow[currentIndex - 1]);
		}
	}

	// Create refresh indicator element
	private createRefreshIndicator(): HTMLElement {
		const indicator = document.createElement('div');
		indicator.className = 'refresh-indicator';
		indicator.innerHTML = `
			<div class="refresh-spinner">
				<svg class="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
			</div>
		`;
		
		indicator.style.cssText = `
			position: absolute;
			top: -60px;
			left: 50%;
			transform: translateX(-50%);
			z-index: 1000;
			background: white;
			border-radius: 50%;
			width: 40px;
			height: 40px;
			display: flex;
			align-items: center;
			justify-content: center;
			box-shadow: 0 2px 10px rgba(0,0,0,0.1);
			opacity: 0;
			transition: opacity 0.3s ease;
		`;
		
		return indicator;
	}

	// Update refresh indicator based on progress
	private updateRefreshIndicator(indicator: HTMLElement, progress: number, triggered: boolean) {
		indicator.style.opacity = Math.min(progress, 1).toString();
		indicator.style.transform = `translateX(-50%) scale(${0.5 + progress * 0.5})`;
		
		if (triggered) {
			indicator.classList.add('triggered');
		} else {
			indicator.classList.remove('triggered');
		}
	}

	// Show refresh indicator
	private showRefreshIndicator(indicator: HTMLElement, loading: boolean) {
		indicator.style.opacity = '1';
		indicator.style.transform = 'translateX(-50%) scale(1)';
		
		if (loading) {
			indicator.classList.add('loading');
		}
	}

	// Hide refresh indicator
	private hideRefreshIndicator(indicator: HTMLElement) {
		indicator.style.opacity = '0';
		indicator.classList.remove('triggered', 'loading');
		
		setTimeout(() => {
			indicator.style.transform = 'translateX(-50%) scale(0.5)';
		}, 300);
	}

	// Cleanup all gesture handlers
	destroy() {
		this.hammers.forEach(hammer => hammer.destroy());
		this.hammers.clear();
	}
}

// Export singleton instance
export const gestures = new GestureHandler();

// Helper functions for common gestures
export const onSwipe = (element: HTMLElement, config: SwipeConfig): GestureManager => {
	return gestures.setupSwipeHandler(element, config);
};

export const onLongPress = (element: HTMLElement, handler: (event: HammerInput) => void): GestureManager => {
	return gestures.setupLongPress(element, handler);
};

export const onPullToRefresh = (element: HTMLElement, handler: () => Promise<void>): GestureManager => {
	return gestures.setupPullToRefresh(element, handler);
};

// Touch event helpers
export const isTouchDevice = (): boolean => {
	return browser && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
};

export const preventZoom = (element: HTMLElement): void => {
	if (!browser) return;
	
	let lastTouchEnd = 0;
	
	element.addEventListener('touchend', (event) => {
		const now = Date.now();
		if (now - lastTouchEnd <= 300) {
			event.preventDefault();
		}
		lastTouchEnd = now;
	}, false);
};

// Haptic feedback (iOS Safari)
export const hapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light'): void => {
	if (!browser) return;
	
	try {
		// @ts-ignore - iOS Safari specific API
		if (navigator.vibrate) {
			const patterns = {
				light: [10],
				medium: [20],
				heavy: [30]
			};
			navigator.vibrate(patterns[type]);
		}
	} catch (error) {
		// Haptic feedback not supported
	}
};