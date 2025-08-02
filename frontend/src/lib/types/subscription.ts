export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'canceled' | 'unpaid';

export type SubscriptionPlan = 'free' | 'premium';

export interface Subscription {
	id: string;
	user_id: string;
	plan: SubscriptionPlan;
	status: SubscriptionStatus;
	stripe_subscription_id?: string;
	stripe_customer_id?: string;
	current_period_start: string;
	current_period_end: string;
	trial_end?: string;
	canceled_at?: string;
	created_at: string;
	updated_at: string;
}

export interface SubscriptionFeatures {
	personal_goals_limit: number;
	can_join_groups: boolean;
	group_limit: number;
	advanced_analytics: boolean;
	export_data: boolean;
	priority_support: boolean;
	custom_categories: boolean;
	api_access: boolean;
}

export interface PaymentMethod {
	id: string;
	user_id: string;
	stripe_payment_method_id: string;
	type: 'card';
	card_brand: string;
	card_last4: string;
	card_exp_month: number;
	card_exp_year: number;
	is_default: boolean;
	created_at: string;
}

export interface Invoice {
	id: string;
	user_id: string;
	subscription_id: string;
	stripe_invoice_id: string;
	amount_paid: number;
	currency: string;
	status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void';
	invoice_pdf?: string;
	hosted_invoice_url?: string;
	period_start: string;
	period_end: string;
	created_at: string;
}

export interface SubscriptionUsage {
	id: string;
	user_id: string;
	subscription_id: string;
	personal_goals_count: number;
	groups_joined: number;
	data_export_requests: number;
	api_requests: number;
	period_start: string;
	period_end: string;
	created_at: string;
}

// Request/Response types
export interface CreateSubscriptionRequest {
	plan: SubscriptionPlan;
	payment_method_id?: string;
}

export interface UpdateSubscriptionRequest {
	plan?: SubscriptionPlan;
}

export interface CancelSubscriptionRequest {
	reason?: string;
	cancel_at_period_end?: boolean;
}

export interface AddPaymentMethodRequest {
	payment_method_id: string;
	set_as_default?: boolean;
}

export interface SubscriptionSummary {
	subscription: Subscription;
	features: SubscriptionFeatures;
	usage: SubscriptionUsage;
	payment_methods: PaymentMethod[];
	recent_invoices: Invoice[];
}

export interface BillingPortalRequest {
	return_url?: string;
}

export interface BillingPortalResponse {
	url: string;
}

// Plan configuration
export interface PlanConfig {
	name: string;
	price: number;
	currency: string;
	interval: 'month' | 'year';
	features: SubscriptionFeatures;
	popular?: boolean;
	description: string;
	stripe_price_id?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlan, PlanConfig> = {
	free: {
		name: 'Free',
		price: 0,
		currency: 'USD',
		interval: 'month',
		description: 'Perfect for getting started with personal goal tracking',
		features: {
			personal_goals_limit: 3,
			can_join_groups: false,
			group_limit: 0,
			advanced_analytics: false,
			export_data: false,
			priority_support: false,
			custom_categories: false,
			api_access: false
		}
	},
	premium: {
		name: 'Premium',
		price: 9.99,
		currency: 'USD',
		interval: 'month',
		description: 'Unlock the full power of group accountability and advanced features',
		popular: true,
		features: {
			personal_goals_limit: -1, // Unlimited
			can_join_groups: true,
			group_limit: 10,
			advanced_analytics: true,
			export_data: true,
			priority_support: true,
			custom_categories: true,
			api_access: true
		},
		stripe_price_id: 'price_premium_monthly' // Will be set from environment
	}
};

// Helper functions
export const getPlanConfig = (plan: SubscriptionPlan): PlanConfig => {
	return SUBSCRIPTION_PLANS[plan];
};

export const getSubscriptionFeatures = (plan: SubscriptionPlan): SubscriptionFeatures => {
	return SUBSCRIPTION_PLANS[plan].features;
};

export const isActive = (subscription: Subscription): boolean => {
	return subscription.status === 'active' || subscription.status === 'trial';
};

export const isInTrial = (subscription: Subscription): boolean => {
	if (!subscription.trial_end) return false;
	
	const trialEnd = new Date(subscription.trial_end);
	const now = new Date();
	
	return subscription.status === 'trial' && now < trialEnd;
};

export const isPremium = (subscription: Subscription): boolean => {
	return subscription.plan === 'premium' && isActive(subscription);
};

export const getDaysRemainingInTrial = (subscription: Subscription): number => {
	if (!isInTrial(subscription) || !subscription.trial_end) return 0;
	
	const trialEnd = new Date(subscription.trial_end);
	const now = new Date();
	const diffTime = trialEnd.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	
	return Math.max(diffDays, 0);
};

export const canCreatePersonalGoal = (subscription: Subscription, currentGoalsCount: number): boolean => {
	const features = getSubscriptionFeatures(subscription.plan);
	
	if (features.personal_goals_limit === -1) return true; // Unlimited
	
	return currentGoalsCount < features.personal_goals_limit;
};

export const canJoinGroups = (subscription: Subscription): boolean => {
	const features = getSubscriptionFeatures(subscription.plan);
	return features.can_join_groups && isActive(subscription);
};

export const hasAdvancedAnalytics = (subscription: Subscription): boolean => {
	const features = getSubscriptionFeatures(subscription.plan);
	return features.advanced_analytics && isActive(subscription);
};

export const getSubscriptionStatusColor = (status: SubscriptionStatus): string => {
	switch (status) {
		case 'trial':
			return 'text-blue-600 bg-blue-100';
		case 'active':
			return 'text-green-600 bg-green-100';
		case 'past_due':
			return 'text-yellow-600 bg-yellow-100';
		case 'canceled':
			return 'text-gray-600 bg-gray-100';
		case 'unpaid':
			return 'text-red-600 bg-red-100';
		default:
			return 'text-gray-600 bg-gray-100';
	}
};

export const getSubscriptionStatusMessage = (subscription: Subscription): string => {
	switch (subscription.status) {
		case 'trial':
			const daysLeft = getDaysRemainingInTrial(subscription);
			return `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left in trial`;
		case 'active':
			return 'Active subscription';
		case 'past_due':
			return 'Payment past due';
		case 'canceled':
			return 'Subscription canceled';
		case 'unpaid':
			return 'Payment required';
		default:
			return 'Unknown status';
	}
};

export const getPlanPrice = (plan: SubscriptionPlan): string => {
	const config = getPlanConfig(plan);
	
	if (config.price === 0) return 'Free';
	
	return `$${config.price}/${config.interval}`;
};

export const formatPrice = (amount: number, currency: string = 'USD'): string => {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: currency
	}).format(amount);
};

export const getUsagePercentage = (current: number, limit: number): number => {
	if (limit === -1) return 0; // Unlimited
	if (limit === 0) return 100;
	
	return Math.min((current / limit) * 100, 100);
};

export const getUsageColor = (percentage: number): string => {
	if (percentage >= 100) return 'text-red-600 bg-red-100';
	if (percentage >= 80) return 'text-orange-600 bg-orange-100';
	if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
	return 'text-green-600 bg-green-100';
};

export const shouldShowUpgradePrompt = (subscription: Subscription, feature: keyof SubscriptionFeatures): boolean => {
	if (isPremium(subscription)) return false;
	
	const features = getSubscriptionFeatures(subscription.plan);
	return !features[feature];
};

export const getUpgradeMessage = (feature: string): string => {
	const messages: Record<string, string> = {
		'groups': 'Join accountability groups with Premium! 🤝',
		'analytics': 'Get detailed analytics with Premium! 📊',
		'unlimited_goals': 'Create unlimited goals with Premium! 🎯',
		'export': 'Export your data with Premium! 📥',
		'api': 'Access our API with Premium! 🔌',
		'support': 'Get priority support with Premium! 💬'
	};
	
	return messages[feature] || 'Upgrade to Premium for more features! ✨';
};

export const getCardBrandColor = (brand: string): string => {
	switch (brand.toLowerCase()) {
		case 'visa':
			return 'text-blue-600';
		case 'mastercard':
			return 'text-red-600';
		case 'amex':
		case 'american_express':
			return 'text-green-600';
		case 'discover':
			return 'text-orange-600';
		default:
			return 'text-gray-600';
	}
};

export const getCardBrandIcon = (brand: string): string => {
	switch (brand.toLowerCase()) {
		case 'visa':
			return '💳';
		case 'mastercard':
			return '💳';
		case 'amex':
		case 'american_express':
			return '💳';
		case 'discover':
			return '💳';
		default:
			return '💳';
	}
};