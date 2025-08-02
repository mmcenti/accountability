import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { apiClient, handleApiError } from '$lib/utils/api';
import type { 
	Group, 
	GroupWithMembers,
	GroupGoal,
	GroupGoalWithProgress,
	CreateGroupRequest, 
	UpdateGroupRequest, 
	JoinGroupRequest,
	CreateGroupGoalRequest,
	UpdateGroupGoalRequest,
	SetTargetRequest,
	AddGroupProgressRequest,
	LeaderboardEntry,
	MemberProgressSummary,
	GroupStatus 
} from '$lib/types/groups';
import { toast } from 'svelte-french-toast';

interface GroupsState {
	groups: GroupWithMembers[];
	currentGroup: GroupWithMembers | null;
	groupGoals: GroupGoalWithProgress[];
	currentGroupGoal: GroupGoalWithProgress | null;
	leaderboards: Record<string, LeaderboardEntry[]>;
	isLoading: boolean;
	isCreating: boolean;
	isUpdating: boolean;
	isJoining: boolean;
	lastSync: number | null;
}

const initialState: GroupsState = {
	groups: [],
	currentGroup: null,
	groupGoals: [],
	currentGroupGoal: null,
	leaderboards: {},
	isLoading: false,
	isCreating: false,
	isUpdating: false,
	isJoining: false,
	lastSync: null
};

const createGroupsStore = () => {
	const { subscribe, set, update } = writable<GroupsState>(initialState);

	return {
		subscribe,

		// Load all groups for current user
		loadGroups: async () => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const groups = await apiClient.get<GroupWithMembers[]>('/groups');
				
				update(state => ({
					...state,
					groups,
					isLoading: false,
					lastSync: Date.now()
				}));
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Create new group
		createGroup: async (groupData: CreateGroupRequest): Promise<GroupWithMembers> => {
			update(state => ({ ...state, isCreating: true }));
			
			try {
				const newGroup = await apiClient.post<GroupWithMembers>('/groups', groupData);
				
				update(state => ({
					...state,
					groups: [...state.groups, newGroup],
					isCreating: false,
					lastSync: Date.now()
				}));

				toast.success('Group created successfully! 🎉');
				return newGroup;
			} catch (error) {
				update(state => ({ ...state, isCreating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Join group with invite code
		joinGroup: async (joinData: JoinGroupRequest): Promise<GroupWithMembers> => {
			update(state => ({ ...state, isJoining: true }));
			
			try {
				const group = await apiClient.post<GroupWithMembers>('/groups/join', joinData);
				
				update(state => ({
					...state,
					groups: [...state.groups, group],
					isJoining: false,
					lastSync: Date.now()
				}));

				toast.success(`Welcome to ${group.group.name}! 🤝`);
				return group;
			} catch (error) {
				update(state => ({ ...state, isJoining: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Update group
		updateGroup: async (groupId: string, groupData: UpdateGroupRequest): Promise<GroupWithMembers> => {
			update(state => ({ ...state, isUpdating: true }));
			
			try {
				const updatedGroup = await apiClient.put<GroupWithMembers>(`/groups/${groupId}`, groupData);
				
				update(state => ({
					...state,
					groups: state.groups.map(group => 
						group.group.id === groupId ? updatedGroup : group
					),
					currentGroup: state.currentGroup?.group.id === groupId ? updatedGroup : state.currentGroup,
					isUpdating: false,
					lastSync: Date.now()
				}));

				toast.success('Group updated successfully! ✨');
				return updatedGroup;
			} catch (error) {
				update(state => ({ ...state, isUpdating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Leave group
		leaveGroup: async (groupId: string): Promise<void> => {
			try {
				await apiClient.post(`/groups/${groupId}/leave`);
				
				update(state => ({
					...state,
					groups: state.groups.filter(group => group.group.id !== groupId),
					currentGroup: state.currentGroup?.group.id === groupId ? null : state.currentGroup,
					lastSync: Date.now()
				}));

				toast.success('Left group successfully');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get group details
		getGroup: async (groupId: string): Promise<GroupWithMembers> => {
			try {
				const group = await apiClient.get<GroupWithMembers>(`/groups/${groupId}`);
				
				update(state => ({
					...state,
					currentGroup: group
				}));

				return group;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Set current group
		setCurrentGroup: (group: GroupWithMembers | null) => {
			update(state => ({ ...state, currentGroup: group }));
		},

		// Load group goals
		loadGroupGoals: async (groupId: string) => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const groupGoals = await apiClient.get<GroupGoalWithProgress[]>(`/groups/${groupId}/goals`);
				
				update(state => ({
					...state,
					groupGoals,
					isLoading: false,
					lastSync: Date.now()
				}));
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Create group goal
		createGroupGoal: async (groupId: string, goalData: CreateGroupGoalRequest): Promise<GroupGoal> => {
			update(state => ({ ...state, isCreating: true }));
			
			try {
				const newGoal = await apiClient.post<GroupGoal>(`/groups/${groupId}/goals`, goalData);
				
				// Reload group goals to get updated data
				await groupsStore.loadGroupGoals(groupId);
				
				update(state => ({ ...state, isCreating: false }));

				toast.success('Group goal created! Time to set your targets! 🎯');
				return newGoal;
			} catch (error) {
				update(state => ({ ...state, isCreating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Update group goal
		updateGroupGoal: async (groupId: string, goalId: string, goalData: UpdateGroupGoalRequest): Promise<GroupGoal> => {
			update(state => ({ ...state, isUpdating: true }));
			
			try {
				const updatedGoal = await apiClient.put<GroupGoal>(`/groups/${groupId}/goals/${goalId}`, goalData);
				
				// Reload group goals to get updated data
				await groupsStore.loadGroupGoals(groupId);
				
				update(state => ({ ...state, isUpdating: false }));

				toast.success('Group goal updated successfully! ✨');
				return updatedGoal;
			} catch (error) {
				update(state => ({ ...state, isUpdating: false }));
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Set your target for a group goal
		setTarget: async (groupId: string, goalId: string, targetData: SetTargetRequest): Promise<void> => {
			try {
				await apiClient.post(`/groups/${groupId}/goals/${goalId}/target`, targetData);
				
				// Reload group goals to get updated data
				await groupsStore.loadGroupGoals(groupId);

				toast.success(`Target set: ${targetData.target_amount} per period! 💪`);
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Add progress to group goal (with penalty carry-over)
		addGroupProgress: async (groupId: string, goalId: string, progressData: AddGroupProgressRequest): Promise<void> => {
			try {
				await apiClient.post(`/groups/${groupId}/goals/${goalId}/progress`, progressData);
				
				// Reload group goals to get updated data with penalty calculations
				await groupsStore.loadGroupGoals(groupId);

				toast.success(`Progress logged! +${progressData.amount} 📈`);
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get group goal details
		getGroupGoal: async (groupId: string, goalId: string): Promise<GroupGoalWithProgress> => {
			try {
				const groupGoal = await apiClient.get<GroupGoalWithProgress>(`/groups/${groupId}/goals/${goalId}`);
				
				update(state => ({
					...state,
					currentGroupGoal: groupGoal
				}));

				return groupGoal;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Get leaderboard for group goal
		getLeaderboard: async (groupId: string, goalId: string): Promise<LeaderboardEntry[]> => {
			try {
				const leaderboard = await apiClient.get<LeaderboardEntry[]>(`/groups/${groupId}/goals/${goalId}/leaderboard`);
				
				update(state => ({
					...state,
					leaderboards: {
						...state.leaderboards,
						[goalId]: leaderboard
					}
				}));

				return leaderboard;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Remove member from group
		removeMember: async (groupId: string, userId: string): Promise<void> => {
			try {
				await apiClient.delete(`/groups/${groupId}/members/${userId}`);
				
				// Reload group to get updated member list
				await groupsStore.getGroup(groupId);

				toast.success('Member removed from group');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Promote member to admin
		promoteMember: async (groupId: string, userId: string): Promise<void> => {
			try {
				await apiClient.post(`/groups/${groupId}/members/${userId}/promote`);
				
				// Reload group to get updated member roles
				await groupsStore.getGroup(groupId);

				toast.success('Member promoted to admin');
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Generate new invite code
		regenerateInviteCode: async (groupId: string): Promise<string> => {
			try {
				const response = await apiClient.post<{ invite_code: string }>(`/groups/${groupId}/regenerate-invite`);
				
				// Reload group to get updated invite code
				await groupsStore.getGroup(groupId);

				toast.success('New invite code generated!');
				return response.invite_code;
			} catch (error) {
				toast.error(handleApiError(error));
				throw error;
			}
		},

		// Update group status
		updateGroupStatus: async (groupId: string, status: GroupStatus): Promise<void> => {
			await groupsStore.updateGroup(groupId, { status });
		},

		// Quick progress logging (for mobile)
		quickAddGroupProgress: async (groupId: string, goalId: string, amount: number): Promise<void> => {
			await groupsStore.addGroupProgress(groupId, goalId, { amount });
		},

		// Set current group goal
		setCurrentGroupGoal: (groupGoal: GroupGoalWithProgress | null) => {
			update(state => ({ ...state, currentGroupGoal: groupGoal }));
		},

		// Clear store
		clear: () => {
			set(initialState);
		}
	};
};

// Export groups store
export const groupsStore = createGroupsStore();

// Derived stores for convenience
export const activeGroups = derived(
	groupsStore,
	$groups => $groups.groups.filter(group => group.group.status === 'active')
);

export const myGroups = derived(
	groupsStore,
	$groups => $groups.groups
);

export const groupsByRole = derived(
	groupsStore,
	$groups => {
		const owned = $groups.groups.filter(group => group.your_role === 'owner');
		const adminOf = $groups.groups.filter(group => group.your_role === 'admin');
		const memberOf = $groups.groups.filter(group => group.your_role === 'member');

		return { owned, adminOf, memberOf };
	}
);

export const activeGroupGoals = derived(
	groupsStore,
	$groups => $groups.groupGoals.filter(goal => goal.goal.is_active)
);

export const currentGroupGoal = derived(
	groupsStore,
	$groups => $groups.currentGroupGoal
);

export const currentGroup = derived(
	groupsStore,
	$groups => $groups.currentGroup
);

export const isLoading = derived(
	groupsStore,
	$groups => $groups.isLoading
);

export const groupStats = derived(
	groupsStore,
	$groups => {
		const total = $groups.groups.length;
		const active = $groups.groups.filter(g => g.group.status === 'active').length;
		const totalMembers = $groups.groups.reduce((sum, g) => sum + g.member_count, 0);
		const activeGoals = $groups.groupGoals.filter(g => g.goal.is_active).length;

		return {
			total,
			active,
			totalMembers,
			activeGoals
		};
	}
);

// Penalty carry-over helpers
export const getTotalPenalty = derived(
	groupsStore,
	$groups => {
		return $groups.groupGoals.reduce((total, goalWithProgress) => {
			return total + (goalWithProgress.your_progress?.penalty_amount || 0);
		}, 0);
	}
);

export const getPenaltyByGoal = derived(
	groupsStore,
	$groups => {
		const penaltyMap: Record<string, number> = {};
		
		$groups.groupGoals.forEach(goalWithProgress => {
			penaltyMap[goalWithProgress.goal.id] = goalWithProgress.your_progress?.penalty_amount || 0;
		});

		return penaltyMap;
	}
);