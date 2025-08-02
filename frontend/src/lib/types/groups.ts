export type GroupStatus = 'active' | 'paused' | 'completed' | 'disbanded';

export type MemberRole = 'owner' | 'admin' | 'member';

export interface Group {
	id: string;
	name: string;
	description?: string;
	invite_code: string;
	status: GroupStatus;
	max_members: number;
	is_public: boolean;
	created_by: string;
	created_at: string;
	updated_at: string;
}

export interface GroupMember {
	id: string;
	group_id: string;
	user_id: string;
	role: MemberRole;
	joined_at: string;
}

export interface GroupGoal {
	id: string;
	group_id: string;
	name: string;
	description?: string;
	unit: string;
	period_type: 'weekly' | 'monthly';
	period_duration: number;
	start_date: string;
	end_date?: string;
	is_active: boolean;
	penalty_enabled: boolean;
	penalty_carry_over: boolean;
	created_at: string;
	updated_at: string;
}

export interface GroupGoalPeriod {
	id: string;
	group_goal_id: string;
	period_number: number;
	start_date: string;
	end_date: string;
	is_current: boolean;
	is_completed: boolean;
	created_at: string;
}

export interface GroupGoalProgress {
	id: string;
	group_goal_id: string;
	period_id: string;
	user_id: string;
	target_amount: number;
	current_amount: number;
	penalty_amount: number;
	is_completed: boolean;
	created_at: string;
	updated_at: string;
}

export interface DailyEntry {
	user_id: string;
	date: string;
	amount: number;
	note?: string;
}

// Composite types
export interface GroupWithMembers {
	group: Group;
	members: GroupMemberProfile[];
	member_count: number;
	your_role: MemberRole;
}

export interface GroupMemberProfile {
	user_id: string;
	first_name: string;
	last_name: string;
	avatar?: string;
	role: MemberRole;
	joined_at: string;
}

export interface GroupGoalWithProgress {
	goal: GroupGoal;
	current_period: GroupGoalPeriod;
	your_progress: GroupGoalProgress;
	all_progress: MemberProgressSummary[];
	leaderboard: LeaderboardEntry[];
}

export interface MemberProgressSummary {
	user_id: string;
	first_name: string;
	last_name: string;
	avatar?: string;
	target_amount: number;
	current_amount: number;
	penalty_amount: number;
	progress_percentage: number;
	is_completed: boolean;
	rank: number;
}

export interface Leaderboard {
	period_id: string;
	entries: LeaderboardEntry[];
	updated_at: string;
}

export interface LeaderboardEntry {
	rank: number;
	user_id: string;
	first_name: string;
	last_name: string;
	avatar?: string;
	current_amount: number;
	target_amount: number;
	progress_percentage: number;
	penalty_amount: number;
	is_completed: boolean;
}

// Request/Response types
export interface CreateGroupRequest {
	name: string;
	description?: string;
	max_members?: number;
	is_public?: boolean;
}

export interface UpdateGroupRequest {
	name?: string;
	description?: string;
	max_members?: number;
	is_public?: boolean;
	status?: GroupStatus;
}

export interface JoinGroupRequest {
	invite_code: string;
}

export interface CreateGroupGoalRequest {
	name: string;
	description?: string;
	unit: string;
	period_type: 'weekly' | 'monthly';
	period_duration?: number;
	start_date: string;
	end_date?: string;
	penalty_enabled?: boolean;
	penalty_carry_over?: boolean;
}

export interface UpdateGroupGoalRequest {
	name?: string;
	description?: string;
	unit?: string;
	end_date?: string;
	penalty_enabled?: boolean;
	penalty_carry_over?: boolean;
	is_active?: boolean;
}

export interface SetTargetRequest {
	target_amount: number;
}

export interface AddGroupProgressRequest {
	amount: number;
	note?: string;
	date?: string;
}

// Helper functions
export const generateInviteCode = (): string => {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	for (let i = 0; i < 6; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
};

export const calculateProgressPercentage = (current: number, target: number): number => {
	if (target <= 0) return 0;
	const percentage = (current / target) * 100;
	return Math.min(percentage, 100);
};

export const calculatePenaltyCarryOver = (
	previousPenalty: number,
	missedAmount: number,
	carryOverEnabled: boolean
): number => {
	if (!carryOverEnabled) return 0;
	return previousPenalty + missedAmount;
};

export const isOwner = (role: MemberRole): boolean => {
	return role === 'owner';
};

export const isAdmin = (role: MemberRole): boolean => {
	return role === 'admin' || role === 'owner';
};

export const canManageGroup = (role: MemberRole): boolean => {
	return isAdmin(role);
};

export const canManageMembers = (role: MemberRole): boolean => {
	return isAdmin(role);
};

export const getMemberDisplayName = (member: GroupMemberProfile): string => {
	return `${member.first_name} ${member.last_name}`;
};

export const formatInviteCode = (code: string): string => {
	return code.replace(/(.{3})/g, '$1-').slice(0, -1);
};

export const getRoleDisplayName = (role: MemberRole): string => {
	switch (role) {
		case 'owner':
			return 'Owner';
		case 'admin':
			return 'Admin';
		case 'member':
			return 'Member';
		default:
			return 'Member';
	}
};

export const getRoleColor = (role: MemberRole): string => {
	switch (role) {
		case 'owner':
			return 'text-purple-600 bg-purple-100';
		case 'admin':
			return 'text-blue-600 bg-blue-100';
		case 'member':
			return 'text-gray-600 bg-gray-100';
		default:
			return 'text-gray-600 bg-gray-100';
	}
};

export const getGroupStatusColor = (status: GroupStatus): string => {
	switch (status) {
		case 'active':
			return 'text-green-600 bg-green-100';
		case 'paused':
			return 'text-yellow-600 bg-yellow-100';
		case 'completed':
			return 'text-blue-600 bg-blue-100';
		case 'disbanded':
			return 'text-red-600 bg-red-100';
		default:
			return 'text-gray-600 bg-gray-100';
	}
};

export const getPenaltyDescription = (penaltyAmount: number, unit: string): string => {
	if (penaltyAmount <= 0) return 'No penalty';
	
	return `${penaltyAmount} ${unit} penalty`;
};

export const getProgressStatusEmoji = (progressPercentage: number, isCompleted: boolean): string => {
	if (isCompleted) return '🎉';
	if (progressPercentage >= 90) return '🔥';
	if (progressPercentage >= 75) return '💪';
	if (progressPercentage >= 50) return '📈';
	if (progressPercentage >= 25) return '⚡';
	return '🎯';
};

export const sortLeaderboard = (entries: LeaderboardEntry[]): LeaderboardEntry[] => {
	return [...entries].sort((a, b) => {
		// Completed goals first
		if (a.is_completed && !b.is_completed) return -1;
		if (!a.is_completed && b.is_completed) return 1;
		
		// Then by progress percentage
		if (a.progress_percentage !== b.progress_percentage) {
			return b.progress_percentage - a.progress_percentage;
		}
		
		// Then by current amount
		return b.current_amount - a.current_amount;
	});
};