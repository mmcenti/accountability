import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { apiClient, handleApiError } from '$lib/utils/api';
import type { 
	Goal, 
	GoalWithProgress, 
	CreateGoalRequest, 
	UpdateGoalRequest, 
	AddProgressRequest, 
	GoalAnalytics,
	GoalStatus,
	GoalCategory 
} from '$lib/types/goals';
import { toast } from 'svelte-french-toast';

interface GoalsState {
	goals: Goal[];
	goalsWithProgress: GoalWithProgress[];
	currentGoal: Goal | null;
	analytics: Record<string, GoalAnalytics>;
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	lastSync: number | null;
}

const initialState: GoalsState = {
	goals: [],
	goalsWithProgress: [],
	currentGoal: null,
	analytics: {},
	isLoading: false,
	isCreating: false,
	isUpdating: false,
	lastSync: null
};

const createGoalsStore = () => {
	const { subscribe, set, update } = writable<GoalsState>(initialState);

	return {
		subscribe,

		// Load all goals
		loadGoals: async () => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const goals = await apiClient.get<Goal[]>('/goals');
				
				update(state => ({
					...state,
					goals,
					isLoading: false,
					lastSync: Date.now()
				}));
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Load goals with progress
		loadGoalsWithProgress: async () => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const goalsWithProgress = await apiClient.get<GoalWithProgress[]>('/goals/with-progress');
				
				update(state => ({
					...state,
					goalsWithProgress,
					isLoading: false,
					lastSync: Date.now()
				}));
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Create new goal
		createGoal: async (goalData: CreateGoalRequest): Promise<Goal> => {
			update(state => ({ ...state, isCreating: true }));
			
			try {
				const newGoal = await apiClient.post<Goal>('/goals', goalData);
				
				update(state => ({
					...state,
					goals: [...state.goals, newGoal],
					isCreating: false,
					lastSync: Date.now()
				}));

				toast.success('Goal created successfully! 🎯');
				return newGoal;
			} catch (error) {
				update(state => ({ ...state, isCreating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Update goal
		updateGoal: async (goalId: string, goalData: UpdateGoalRequest): Promise<Goal> => {
			update(state => ({ ...state, isUpdating: true }));
			
			try {
				const updatedGoal = await apiClient.put<Goal>(`/goals/${goalId}`, goalData);
				
				update(state => ({
					...state,
					goals: state.goals.map(goal => 
						goal.id === goalId ? updatedGoal : goal
					),
					currentGoal: state.currentGoal?.id === goalId ? updatedGoal : state.currentGoal,
					isUpdating: false,
					lastSync: Date.now()
				}));

				toast.success('Goal updated successfully! ✨');
				return updatedGoal;
			} catch (error) {
				update(state => ({ ...state, isUpdating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Delete goal
		deleteGoal: async (goalId: string): Promise<void> => {
			try {
				await apiClient.delete(`/goals/${goalId}`);
				
				update(state => ({
					...state,
					goals: state.goals.filter(goal => goal.id !== goalId),
					goalsWithProgress: state.goalsWithProgress.filter(
						gwp => gwp.goal.id !== goalId
					),
					currentGoal: state.currentGoal?.id === goalId ? null : state.currentGoal,
					lastSync: Date.now()
				}));

				toast.success('Goal deleted successfully');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Add progress to goal
		addProgress: async (goalId: string, progressData: AddProgressRequest): Promise<void> => {
			try {
				await apiClient.post(`/goals/${goalId}/progress`, progressData);
				
				// Reload goals to get updated progress
				await goalsStore.loadGoalsWithProgress();

				toast.success(`Progress logged! +${progressData.amount} 📈`);
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get goal by ID
		getGoal: async (goalId: string): Promise<Goal> => {
			try {
				const goal = await apiClient.get<Goal>(`/goals/${goalId}`);
				
				update(state => ({
					...state,
					currentGoal: goal
				}));

				return goal;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get goal analytics
		getAnalytics: async (goalId: string): Promise<GoalAnalytics> => {
			try {
				const analytics = await apiClient.get<GoalAnalytics>(`/goals/${goalId}/analytics`);
				
				update(state => ({
					...state,
					analytics: {
						...state.analytics,
						[goalId]: analytics
					}
				}));

				return analytics;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Set current goal
		setCurrentGoal: (goal: Goal | null) => {
			update(state => ({ ...state, currentGoal: goal }));
		},

		// Update goal status
		updateGoalStatus: async (goalId: string, status: GoalStatus): Promise<void> => {
			await goalsStore.updateGoal(goalId, { status });
		},

		// Quick progress logging (for mobile)
		quickAddProgress: async (goalId: string, amount: number): Promise<void> => {
			await goalsStore.addProgress(goalId, { amount });
		},

		// Mark goal as completed
		completeGoal: async (goalId: string): Promise<void> => {
			await goalsStore.updateGoalStatus(goalId, 'completed');
			toast.success('🎉 Congratulations! Goal completed!');
		},

		// Restart goal (reset progress)
		restartGoal: async (goalId: string): Promise<void> => {
			try {
				await apiClient.post(`/goals/${goalId}/restart`);
				await goalsStore.loadGoalsWithProgress();
				toast.success('Goal restarted successfully! 🔄');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Clear store
		clear: () => {
			set(initialState);
		}
	};
};

// Export goals store
export const goalsStore = createGoalsStore();

// Derived stores for convenience
export const activeGoals = derived(
	goalsStore,
	$goals => $goals.goals.filter(goal => goal.status === 'active' || goal.status === 'in_progress')
);

export const completedGoals = derived(
	goalsStore,
	$goals => $goals.goals.filter(goal => goal.status === 'completed')
);

export const goalsByCategory = derived(
	goalsStore,
	$goals => {
		const grouped: Record<GoalCategory, Goal[]> = {
			fitness: [],
			health: [],
			education: [],
			career: [],
			finance: [],
			hobbies: [],
			relationship: [],
			personal: [],
			other: []
		};

		$goals.goals.forEach(goal => {
			grouped[goal.category].push(goal);
		});

		return grouped;
	}
);

export const todaysProgress = derived(
	goalsStore,
	$goals => {
		const today = new Date().toISOString().split('T')[0];
		
		return $goals.goalsWithProgress.map(gwp => ({
			goal: gwp.goal,
			todayAmount: gwp.recent_progress
				.filter(p => p.date.startsWith(today))
				.reduce((sum, p) => sum + p.amount, 0)
		}));
	}
);

export const goalStats = derived(
	goalsStore,
	$goals => {
		const total = $goals.goals.length;
		const active = $goals.goals.filter(g => g.status === 'active' || g.status === 'in_progress').length;
		const completed = $goals.goals.filter(g => g.status === 'completed').length;
		const completionRate = total > 0 ? (completed / total) * 100 : 0;

		return {
			total,
			active,
			completed,
			completionRate: Math.round(completionRate)
		};
	}
);

export const isLoading = derived(
	goalsStore,
	$goals => $goals.isLoading
);

export const currentGoal = derived(
	goalsStore,
	$goals => $goals.currentGoal
);