import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { apiClient, handleApiError } from '$lib/utils/api';
import type { 
	Subscription,
	SubscriptionSummary,
	PaymentMethod,
	Invoice,
	CreateSubscriptionRequest,
	UpdateSubscriptionRequest,
	CancelSubscriptionRequest,
	AddPaymentMethodRequest,
	BillingPortalRequest,
	BillingPortalResponse,
	SubscriptionPlan 
} from '$lib/types/subscription';
import { 
	isActive, 
	isPremium, 
	isInTrial, 
	canCreatePersonalGoal,
	canJoinGroups,
	hasAdvancedAnalytics,
	getSubscriptionFeatures 
} from '$lib/types/subscription';
import { toast } from 'svelte-french-toast';

interface SubscriptionState {
	subscription: Subscription | null;
	summary: SubscriptionSummary | null;
	paymentMethods: PaymentMethod[];
	invoices: Invoice[];
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isCanceling: boolean;
	lastSync: number | null;
	stripeLoaded: boolean;
}

const initialState: SubscriptionState = {
	subscription: null,
	summary: null,
	paymentMethods: [],
	invoices: [],
	isLoading: false,
	isCreating: false,
	isUpdating: false,
	isCanceling: false,
	lastSync: null,
	stripeLoaded: false
};

const createSubscriptionStore = () => {
	const { subscribe, set, update } = writable<SubscriptionState>(initialState);

	return {
		subscribe,

		// Initialize Stripe
		initializeStripe: async () => {
			if (!browser || typeof window === 'undefined') return null;

			try {
				// Load Stripe.js
				const { loadStripe } = await import('@stripe/stripe-js');
				const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
				
				update(state => ({ ...state, stripeLoaded: true }));
				return stripe;
			} catch (error) {
				console.error('Failed to load Stripe:', error);
				toast.error('Failed to load payment system');
				return null;
			}
		},

		// Load subscription summary
		loadSubscription: async () => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const summary = await apiClient.get<SubscriptionSummary>('/subscription');
				
				update(state => ({
					...state,
					subscription: summary.subscription,
					summary,
					paymentMethods: summary.payment_methods,
					invoices: summary.recent_invoices,
					isLoading: false,
					lastSync: Date.now()
				}));
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Create subscription
		createSubscription: async (subscriptionData: CreateSubscriptionRequest): Promise<Subscription> => {
			update(state => ({ ...state, isCreating: true }));
			
			try {
				const subscription = await apiClient.post<Subscription>('/subscription', subscriptionData);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();
				
				update(state => ({ ...state, isCreating: false }));

				toast.success('🎉 Welcome to Premium! Your subscription is now active!');
				return subscription;
			} catch (error) {
				update(state => ({ ...state, isCreating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Update subscription
		updateSubscription: async (subscriptionData: UpdateSubscriptionRequest): Promise<Subscription> => {
			update(state => ({ ...state, isUpdating: true }));
			
			try {
				const subscription = await apiClient.put<Subscription>('/subscription', subscriptionData);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();
				
				update(state => ({ ...state, isUpdating: false }));

				toast.success('Subscription updated successfully! ✨');
				return subscription;
			} catch (error) {
				update(state => ({ ...state, isUpdating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Cancel subscription
		cancelSubscription: async (cancelData: CancelSubscriptionRequest): Promise<void> => {
			update(state => ({ ...state, isCanceling: true }));
			
			try {
				await apiClient.post('/subscription/cancel', cancelData);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();
				
				update(state => ({ ...state, isCanceling: false }));

				if (cancelData.cancel_at_period_end) {
					toast.success('Subscription will cancel at the end of your billing period');
				} else {
					toast.success('Subscription canceled successfully');
				}
			} catch (error) {
				update(state => ({ ...state, isCanceling: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Resume subscription
		resumeSubscription: async (): Promise<void> => {
			update(state => ({ ...state, isUpdating: true }));
			
			try {
				await apiClient.post('/subscription/resume');
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();
				
				update(state => ({ ...state, isUpdating: false }));

				toast.success('Subscription resumed successfully! 🎉');
			} catch (error) {
				update(state => ({ ...state, isUpdating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Add payment method
		addPaymentMethod: async (paymentData: AddPaymentMethodRequest): Promise<PaymentMethod> => {
			try {
				const paymentMethod = await apiClient.post<PaymentMethod>('/payment-methods', paymentData);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();

				toast.success('Payment method added successfully! 💳');
				return paymentMethod;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Remove payment method
		removePaymentMethod: async (paymentMethodId: string): Promise<void> => {
			try {
				await apiClient.delete(`/payment-methods/${paymentMethodId}`);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();

				toast.success('Payment method removed successfully');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Set default payment method
		setDefaultPaymentMethod: async (paymentMethodId: string): Promise<void> => {
			try {
				await apiClient.post(`/payment-methods/${paymentMethodId}/default`);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();

				toast.success('Default payment method updated');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get billing portal URL
		getBillingPortal: async (returnUrl?: string): Promise<string> => {
			try {
				const response = await apiClient.post<BillingPortalResponse>('/billing-portal', {
					return_url: returnUrl || window.location.href
				});

				return response.url;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Open billing portal
		openBillingPortal: async (returnUrl?: string): Promise<void> => {
			try {
				const portalUrl = await subscriptionStore.getBillingPortal(returnUrl);
				window.location.href = portalUrl;
			} catch (error) {
				// Error already handled in getBillingPortal
			}
		},

		// Create Stripe payment intent for one-time purchases
		createPaymentIntent: async (amount: number, currency: string = 'USD'): Promise<any> => {
			try {
				const response = await apiClient.post('/create-payment-intent', {
					amount: Math.round(amount * 100), // Convert to cents
					currency
				});

				return response;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Handle successful payment
		handlePaymentSuccess: async (paymentIntentId: string): Promise<void> => {
			try {
				await apiClient.post('/payment-success', {
					payment_intent_id: paymentIntentId
				});
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();

				toast.success('Payment processed successfully! 🎉');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Retry failed payment
		retryPayment: async (invoiceId: string): Promise<void> => {
			try {
				await apiClient.post(`/invoices/${invoiceId}/retry`);
				
				// Reload subscription summary
				await subscriptionStore.loadSubscription();

				toast.success('Payment retry initiated');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get invoice details
		getInvoice: async (invoiceId: string): Promise<Invoice> => {
			try {
				return await apiClient.get<Invoice>(`/invoices/${invoiceId}`);
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Download invoice PDF
		downloadInvoice: async (invoiceId: string): Promise<void> => {
			try {
				const invoice = await subscriptionStore.getInvoice(invoiceId);
				
				if (invoice.invoice_pdf) {
					window.open(invoice.invoice_pdf, '_blank');
				} else if (invoice.hosted_invoice_url) {
					window.open(invoice.hosted_invoice_url, '_blank');
				} else {
					toast.error('Invoice PDF not available');
				}
			} catch (error) {
				// Error already handled in getInvoice
			}
		},

		// Check if user can perform action based on subscription
		checkFeatureAccess: (feature: string): boolean => {
			const state = getStateSnapshot();
			if (!state.subscription) return false;

			const features = getSubscriptionFeatures(state.subscription.plan);
			const isSubscriptionActive = isActive(state.subscription);

			switch (feature) {
				case 'groups':
					return features.can_join_groups && isSubscriptionActive;
				case 'analytics':
					return features.advanced_analytics && isSubscriptionActive;
				case 'export':
					return features.export_data && isSubscriptionActive;
				case 'api':
					return features.api_access && isSubscriptionActive;
				case 'priority_support':
					return features.priority_support && isSubscriptionActive;
				default:
					return isSubscriptionActive;
			}
		},

		// Get current subscription state (for external use)
		getState: () => {
			return getStateSnapshot();
		},

		// Clear store
		clear: () => {
			set(initialState);
		}
	};

	// Helper to get current state snapshot
	function getStateSnapshot(): SubscriptionState {
		let currentState: SubscriptionState;
		subscribe(state => currentState = state)();
		return currentState!;
	}
};

// Export subscription store
export const subscriptionStore = createSubscriptionStore();

// Derived stores for convenience
export const currentSubscription = derived(
	subscriptionStore,
	$subscription => $subscription.subscription
);

export const subscriptionSummary = derived(
	subscriptionStore,
	$subscription => $subscription.summary
);

export const isSubscriptionActive = derived(
	currentSubscription,
	$subscription => $subscription ? isActive($subscription) : false
);

export const isSubscriptionPremium = derived(
	currentSubscription,
	$subscription => $subscription ? isPremium($subscription) : false
);

export const isSubscriptionTrial = derived(
	currentSubscription,
	$subscription => $subscription ? isInTrial($subscription) : false
);

export const subscriptionFeatures = derived(
	currentSubscription,
	$subscription => $subscription ? getSubscriptionFeatures($subscription.plan) : null
);

export const canCreateGoals = derived(
	[currentSubscription, subscriptionSummary],
	([$subscription, $summary]) => {
		if (!$subscription || !$summary) return false;
		return canCreatePersonalGoal($subscription, $summary.usage.personal_goals_count);
	}
);

export const canAccessGroups = derived(
	currentSubscription,
	$subscription => $subscription ? canJoinGroups($subscription) : false
);

export const canAccessAnalytics = derived(
	currentSubscription,
	$subscription => $subscription ? hasAdvancedAnalytics($subscription) : false
);

export const paymentMethods = derived(
	subscriptionStore,
	$subscription => $subscription.paymentMethods
);

export const defaultPaymentMethod = derived(
	paymentMethods,
	$methods => $methods.find(method => method.is_default)
);

export const recentInvoices = derived(
	subscriptionStore,
	$subscription => $subscription.invoices
);

export const isLoading = derived(
	subscriptionStore,
	$subscription => $subscription.isLoading
);

export const subscriptionStatus = derived(
	currentSubscription,
	$subscription => $subscription?.status || null
);

export const subscriptionPlan = derived(
	currentSubscription,
	$subscription => $subscription?.plan || 'free'
);

// Helper functions for components
export const requiresPremium = (feature: keyof typeof import('$lib/types/subscription').SUBSCRIPTION_PLANS.premium.features) => {
	return derived(
		[isSubscriptionPremium, subscriptionFeatures],
		([$isPremium, $features]) => {
			if ($isPremium) return false;
			return !$features?.[feature];
		}
	);
};

export const getUpgradePrompt = (feature: string) => {
	return derived(
		isSubscriptionPremium,
		$isPremium => {
			if ($isPremium) return null;
			
			const messages: Record<string, string> = {
				'groups': 'Join accountability groups with Premium! 🤝',
				'analytics': 'Get detailed analytics with Premium! 📊',
				'unlimited_goals': 'Create unlimited goals with Premium! 🎯',
				'export': 'Export your data with Premium! 📥'
			};
			
			return messages[feature] || 'Upgrade to Premium for more features! ✨';
		}
	);
};