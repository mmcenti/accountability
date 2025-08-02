export interface User {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	avatar?: string;
	timezone: string;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface UserProfile {
	id: string;
	first_name: string;
	last_name: string;
	avatar?: string;
	timezone: string;
}

export interface UserStats {
	total_goals: number;
	completed_goals: number;
	active_goals: number;
	completion_rate: number;
	current_streak: number;
	longest_streak: number;
	groups_joined: number;
	total_progress: number;
}

export interface LoginRequest {
	email: string;
	password: string;
}

export interface LoginResponse {
	user: UserProfile;
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface RegisterRequest {
	email: string;
	password: string;
	first_name: string;
	last_name: string;
	timezone: string;
}

export interface RefreshTokenRequest {
	refresh_token: string;
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
}

export interface UpdateUserRequest {
	first_name?: string;
	last_name?: string;
	avatar?: string;
	timezone?: string;
}

export interface PasswordValidationResult {
	is_valid: boolean;
	strength: 'weak' | 'medium' | 'strong' | 'very_strong';
	score: number;
	errors?: string[];
	suggestions?: string[];
}