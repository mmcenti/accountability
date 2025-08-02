import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { persisted } from 'svelte-persisted-store';
import type { User, LoginResponse, UserStats } from '$lib/types/auth';
import { apiClient } from '$lib/utils/api';

interface AuthState {
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	isLoading: boolean;
	isOnline: boolean;
	lastSync: number | null;
}

const initialState: AuthState = {
	user: null,
	accessToken: null,
	refreshToken: null,
	isLoading: false,
	isOnline: true,
	lastSync: null
};

// Create persisted store for auth data
const createAuthStore = () => {
	const { subscribe, set, update } = persisted<AuthState>('chainforge_auth', initialState);

	return {
		subscribe,
		
		// Initialize auth store
		initialize: async () => {
			if (!browser) return;
			
			update(state => ({ ...state, isLoading: true }));
			
			try {
				// Check if we have tokens
				const currentState = await new Promise<AuthState>(resolve => {
					subscribe(state => resolve(state))();
				});
				
				if (currentState.accessToken) {
					// Validate token and get user info
					await authStore.validateSession();
				}
			} catch (error) {
				console.error('Auth initialization error:', error);
				authStore.logout();
			} finally {
				update(state => ({ ...state, isLoading: false }));
			}
		},

		// Login user
		login: async (email: string, password: string): Promise<void> => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const response = await apiClient.post<LoginResponse>('/auth/login', {
					email,
					password
				});

				const { user, access_token, refresh_token } = response;
				
				update(state => ({
					...state,
					user,
					accessToken: access_token,
					refreshToken: refresh_token,
					isLoading: false,
					lastSync: Date.now()
				}));

				// Redirect to dashboard
				goto('/dashboard');
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				throw error;
			}
		},

		// Register new user
		register: async (userData: {
			email: string;
			password: string;
			firstName: string;
			lastName: string;
			timezone: string;
		}): Promise<void> => {
			update(state => ({ ...state, isLoading: true }));
			
			try {
				const response = await apiClient.post<LoginResponse>('/auth/register', userData);
				
				const { user, access_token, refresh_token } = response;
				
				update(state => ({
					...state,
					user,
					accessToken: access_token,
					refreshToken: refresh_token,
					isLoading: false,
					lastSync: Date.now()
				}));

				// Redirect to onboarding
				goto('/onboarding');
			} catch (error) {
				update(state => ({ ...state, isLoading: false }));
				throw error;
			}
		},

		// Validate current session
		validateSession: async (): Promise<void> => {
			try {
				const user = await apiClient.get<User>('/users/me');
				
				update(state => ({
					...state,
					user,
					lastSync: Date.now()
				}));
			} catch (error) {
				// Token might be expired, try refresh
				await authStore.refreshTokens();
			}
		},

		// Refresh access token
		refreshTokens: async (): Promise<void> => {
			const currentState = await new Promise<AuthState>(resolve => {
				subscribe(state => resolve(state))();
			});

			if (!currentState.refreshToken) {
				throw new Error('No refresh token available');
			}

			try {
				const response = await apiClient.post<LoginResponse>('/auth/refresh', {
					refresh_token: currentState.refreshToken
				});

				const { user, access_token, refresh_token } = response;
				
				update(state => ({
					...state,
					user,
					accessToken: access_token,
					refreshToken: refresh_token,
					lastSync: Date.now()
				}));
			} catch (error) {
				// Refresh failed, logout user
				authStore.logout();
				throw error;
			}
		},

		// Update user profile
		updateProfile: async (profileData: Partial<User>): Promise<void> => {
			try {
				const updatedUser = await apiClient.put<User>('/users/me', profileData);
				
				update(state => ({
					...state,
					user: updatedUser,
					lastSync: Date.now()
				}));
			} catch (error) {
				throw error;
			}
		},

		// Logout user
		logout: async (showMessage = true): Promise<void> => {
			try {
				// Notify server about logout
				await apiClient.post('/auth/logout');
			} catch (error) {
				// Ignore errors during logout
				console.warn('Logout request failed:', error);
			}
			
			// Clear local state
			set(initialState);
			
			// Redirect to login
			goto('/login');
		},

		// Set network status
		setNetworkStatus: (isOnline: boolean) => {
			update(state => ({ ...state, isOnline }));
		},

		// Force sync with server
		sync: async (): Promise<void> => {
			await authStore.validateSession();
		}
	};
};

// Export auth store
export const authStore = createAuthStore();

// Derived stores for convenience
export const isAuthenticated = derived(
	authStore,
	$auth => !!$auth.user && !!$auth.accessToken
);

export const currentUser = derived(
	authStore,
	$auth => $auth.user
);

export const isLoading = derived(
	authStore,
	$auth => $auth.isLoading
);

export const isOnline = derived(
	authStore,
	$auth => $auth.isOnline
);

// Setup API client token interceptor
if (browser) {
	apiClient.setTokenProvider(() => {
		return new Promise(resolve => {
			authStore.subscribe(state => {
				resolve(state.accessToken);
			})();
		});
	});

	// Setup token refresh on 401 errors
	apiClient.setTokenRefreshHandler(async () => {
		await authStore.refreshTokens();
	});
}