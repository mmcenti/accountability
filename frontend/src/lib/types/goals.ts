export type GoalStatus = 'active' | 'in_progress' | 'completed' | 'canceled';

export type GoalCategory = 
	| 'fitness' 
	| 'health' 
	| 'education' 
	| 'career' 
	| 'finance' 
	| 'hobbies' 
	| 'relationship' 
	| 'personal' 
	| 'other';

export interface Goal {
	id: string;
	user_id: string;
	name: string;
	description?: string;
	target_amount: number;
	current_amount: number;
	unit: string;
	category: GoalCategory;
	status: GoalStatus;
	start_date: string;
	end_date?: string;
	punishment?: string;
	is_public: boolean;
	created_at: string;
	updated_at: string;
}

export interface GoalProgress {
	id: string;
	goal_id: string;
	amount: number;
	note?: string;
	date: string;
	created_at: string;
}

export interface GoalWithProgress {
	goal: Goal;
	recent_progress: GoalProgress[];
	progress_percentage: number;
	days_remaining?: number;
	average_daily: number;
	required_daily: number;
}

export interface CreateGoalRequest {
	name: string;
	description?: string;
	target_amount: number;
	unit: string;
	category: GoalCategory;
	start_date: string;
	end_date?: string;
	punishment?: string;
	is_public?: boolean;
}

export interface UpdateGoalRequest {
	name?: string;
	description?: string;
	unit?: string;
	category?: GoalCategory;
	end_date?: string;
	punishment?: string;
	is_public?: boolean;
	status?: GoalStatus;
}

export interface AddProgressRequest {
	amount: number;
	note?: string;
	date?: string;
}

export interface GoalAnalytics {
	goal_id: string;
	total_progress: number;
	progress_percentage: number;
	days_active: number;
	days_remaining?: number;
	average_daily: number;
	required_daily: number;
	best_day?: string;
	best_day_amount: number;
	consistency_score: number;
	projected_completion?: string;
	weekly_progress: WeeklyStats[];
	monthly_progress: MonthlyStats[];
}

export interface WeeklyStats {
	week: string;
	amount: number;
	days_active: number;
}

export interface MonthlyStats {
	month: string;
	amount: number;
	days_active: number;
}

// Category configuration
export interface CategoryConfig {
	name: string;
	icon: string;
	color: string;
	description: string;
	commonUnits: string[];
	suggestedTargets: number[];
}

export const GOAL_CATEGORIES: Record<GoalCategory, CategoryConfig> = {
	fitness: {
		name: 'Fitness',
		icon: '💪',
		color: 'bg-green-500',
		description: 'Exercise, workout, and physical activity goals',
		commonUnits: ['minutes', 'hours', 'miles', 'kilometers', 'calories', 'reps', 'sets'],
		suggestedTargets: [30, 60, 150, 300]
	},
	health: {
		name: 'Health',
		icon: '🏥',
		color: 'bg-blue-500',
		description: 'Medical, wellness, and health-related goals',
		commonUnits: ['days', 'hours', 'glasses', 'pills', 'appointments'],
		suggestedTargets: [7, 14, 30, 90]
	},
	education: {
		name: 'Education',
		icon: '📚',
		color: 'bg-purple-500',
		description: 'Learning, studying, and skill development',
		commonUnits: ['hours', 'pages', 'chapters', 'courses', 'lessons'],
		suggestedTargets: [1, 5, 10, 25]
	},
	career: {
		name: 'Career',
		icon: '💼',
		color: 'bg-indigo-500',
		description: 'Professional development and work goals',
		commonUnits: ['hours', 'applications', 'projects', 'meetings', 'certifications'],
		suggestedTargets: [1, 5, 10, 20]
	},
	finance: {
		name: 'Finance',
		icon: '💰',
		color: 'bg-yellow-500',
		description: 'Money management and financial goals',
		commonUnits: ['dollars', 'euros', 'savings', 'investments', 'payments'],
		suggestedTargets: [100, 500, 1000, 5000]
	},
	hobbies: {
		name: 'Hobbies',
		icon: '🎨',
		color: 'bg-pink-500',
		description: 'Creative activities and personal interests',
		commonUnits: ['hours', 'projects', 'pieces', 'sessions', 'performances'],
		suggestedTargets: [1, 5, 10, 25]
	},
	relationship: {
		name: 'Relationships',
		icon: '❤️',
		color: 'bg-red-500',
		description: 'Social connections and relationship goals',
		commonUnits: ['calls', 'meetings', 'dates', 'messages', 'activities'],
		suggestedTargets: [1, 3, 7, 14]
	},
	personal: {
		name: 'Personal',
		icon: '🧘',
		color: 'bg-gray-500',
		description: 'Self-improvement and personal development',
		commonUnits: ['days', 'hours', 'sessions', 'practices', 'habits'],
		suggestedTargets: [7, 14, 21, 30]
	},
	other: {
		name: 'Other',
		icon: '📌',
		color: 'bg-gray-400',
		description: 'Miscellaneous goals that don\'t fit other categories',
		commonUnits: ['items', 'tasks', 'points', 'units', 'achievements'],
		suggestedTargets: [1, 5, 10, 25]
	}
};

// Goal status configuration
export const GOAL_STATUS_CONFIG = {
	active: {
		name: 'Active',
		color: 'text-blue-600 bg-blue-100',
		description: 'Goal is set up and ready to track'
	},
	in_progress: {
		name: 'In Progress',
		color: 'text-yellow-600 bg-yellow-100',
		description: 'Currently working on this goal'
	},
	completed: {
		name: 'Completed',
		color: 'text-green-600 bg-green-100',
		description: 'Goal has been successfully achieved'
	},
	canceled: {
		name: 'Canceled',
		color: 'text-gray-600 bg-gray-100',
		description: 'Goal was stopped before completion'
	}
};

// Helper functions
export const getCategoryConfig = (category: GoalCategory): CategoryConfig => {
	return GOAL_CATEGORIES[category];
};

export const getStatusConfig = (status: GoalStatus) => {
	return GOAL_STATUS_CONFIG[status];
};

export const calculateProgressPercentage = (current: number, target: number): number => {
	if (target <= 0) return 0;
	const percentage = (current / target) * 100;
	return Math.min(percentage, 100);
};

export const calculateDaysRemaining = (endDate?: string): number | null => {
	if (!endDate) return null;
	
	const end = new Date(endDate);
	const now = new Date();
	const diffTime = end.getTime() - now.getTime();
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	
	return diffDays > 0 ? diffDays : 0;
};

export const calculateRequiredDaily = (goal: Goal): number => {
	const remaining = goal.target_amount - goal.current_amount;
	if (remaining <= 0) return 0;
	
	const daysLeft = calculateDaysRemaining(goal.end_date);
	if (!daysLeft || daysLeft <= 0) return remaining;
	
	return remaining / daysLeft;
};

export const isGoalOverdue = (goal: Goal): boolean => {
	if (!goal.end_date) return false;
	
	const endDate = new Date(goal.end_date);
	const now = new Date();
	
	return now > endDate && goal.current_amount < goal.target_amount;
};

export const getGoalStatusColor = (goal: Goal): string => {
	if (isGoalOverdue(goal)) {
		return 'text-red-600 bg-red-100';
	}
	
	return getStatusConfig(goal.status).color;
};