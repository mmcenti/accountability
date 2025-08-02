import { browser } from '$app/environment';
import { toast } from 'svelte-french-toast';

export interface ApiError {
	message: string;
	status: number;
	code?: string;
	details?: any;
}

export class ApiClient {
	private baseURL: string;
	private tokenProvider: (() => Promise<string | null>) | null = null;
	private tokenRefreshHandler: (() => Promise<void>) | null = null;

	constructor(baseURL: string) {
		this.baseURL = baseURL;
	}

	setTokenProvider(provider: () => Promise<string | null>) {
		this.tokenProvider = provider;
	}

	setTokenRefreshHandler(handler: () => Promise<void>) {
		this.tokenRefreshHandler = handler;
	}

	private async getHeaders(includeAuth = true): Promise<Record<string, string>> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};

		if (includeAuth && this.tokenProvider) {
			const token = await this.tokenProvider();
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}
		}

		return headers;
	}

	private async handleResponse<T>(response: Response): Promise<T> {
		if (!response.ok) {
			let errorMessage = 'An error occurred';
			let errorDetails: any = null;

			try {
				const errorData = await response.json();
				errorMessage = errorData.message || errorMessage;
				errorDetails = errorData;
			} catch {
				// If response is not JSON, use status text
				errorMessage = response.statusText || errorMessage;
			}

			const error: ApiError = {
				message: errorMessage,
				status: response.status,
				details: errorDetails
			};

			// Handle specific error cases
			if (response.status === 401 && this.tokenRefreshHandler) {
				try {
					await this.tokenRefreshHandler();
					// Retry the original request
					throw new Error('TOKEN_REFRESHED');
				} catch (refreshError) {
					// Refresh failed, throw original error
					throw error;
				}
			}

			// Show toast for user-facing errors
			if (browser && response.status >= 400 && response.status < 500) {
				toast.error(errorMessage);
			} else if (browser && response.status >= 500) {
				toast.error('Server error. Please try again later.');
			}

			throw error;
		}

		// Handle empty responses
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			return response.json();
		}

		return response.text() as any;
	}

	private async makeRequest<T>(
		endpoint: string,
		options: RequestInit = {},
		includeAuth = true,
		retryCount = 0
	): Promise<T> {
		const url = `${this.baseURL}/api/v1${endpoint}`;
		const headers = await this.getHeaders(includeAuth);

		try {
			const response = await fetch(url, {
				...options,
				headers: {
					...headers,
					...options.headers,
				},
			});

			return await this.handleResponse<T>(response);
		} catch (error) {
			// Handle token refresh retry
			if (error instanceof Error && error.message === 'TOKEN_REFRESHED' && retryCount === 0) {
				return this.makeRequest<T>(endpoint, options, includeAuth, retryCount + 1);
			}

			// Handle network errors
			if (browser && !navigator.onLine) {
				toast.error('You are offline. Please check your connection.');
			}

			throw error;
		}
	}

	async get<T>(endpoint: string, includeAuth = true): Promise<T> {
		return this.makeRequest<T>(endpoint, { method: 'GET' }, includeAuth);
	}

	async post<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
		return this.makeRequest<T>(
			endpoint,
			{
				method: 'POST',
				body: data ? JSON.stringify(data) : undefined,
			},
			includeAuth
		);
	}

	async put<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
		return this.makeRequest<T>(
			endpoint,
			{
				method: 'PUT',
				body: data ? JSON.stringify(data) : undefined,
			},
			includeAuth
		);
	}

	async patch<T>(endpoint: string, data?: any, includeAuth = true): Promise<T> {
		return this.makeRequest<T>(
			endpoint,
			{
				method: 'PATCH',
				body: data ? JSON.stringify(data) : undefined,
			},
			includeAuth
		);
	}

	async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
		return this.makeRequest<T>(endpoint, { method: 'DELETE' }, includeAuth);
	}

	// File upload with progress
	async uploadFile<T>(
		endpoint: string,
		file: File,
		onProgress?: (progress: number) => void
	): Promise<T> {
		const url = `${this.baseURL}/api/v1${endpoint}`;
		const headers = await this.getHeaders(true);
		
		// Remove content-type header for file upload
		delete headers['Content-Type'];

		return new Promise((resolve, reject) => {
			const xhr = new XMLHttpRequest();
			const formData = new FormData();
			formData.append('file', file);

			xhr.upload.addEventListener('progress', (event) => {
				if (event.lengthComputable && onProgress) {
					const progress = (event.loaded / event.total) * 100;
					onProgress(progress);
				}
			});

			xhr.addEventListener('load', async () => {
				if (xhr.status >= 200 && xhr.status < 300) {
					try {
						const response = JSON.parse(xhr.responseText);
						resolve(response);
					} catch {
						resolve(xhr.responseText as any);
					}
				} else {
					reject(new Error(`Upload failed: ${xhr.statusText}`));
				}
			});

			xhr.addEventListener('error', () => {
				reject(new Error('Upload failed'));
			});

			xhr.open('POST', url);
			
			// Set auth header
			if (headers.Authorization) {
				xhr.setRequestHeader('Authorization', headers.Authorization);
			}

			xhr.send(formData);
		});
	}
}

// Create and export API client instance
const API_URL = browser 
	? (import.meta.env.VITE_API_URL || 'http://localhost:8080')
	: 'http://localhost:8080';

export const apiClient = new ApiClient(API_URL);

// Helper function for handling API errors in components
export const handleApiError = (error: any): string => {
	if (error && typeof error === 'object' && 'message' in error) {
		return error.message;
	}
	
	if (typeof error === 'string') {
		return error;
	}
	
	return 'An unexpected error occurred';
};

// Helper function for retry logic
export const withRetry = async <T>(
	fn: () => Promise<T>,
	maxRetries = 3,
	delay = 1000
): Promise<T> => {
	let lastError: any;
	
	for (let i = 0; i < maxRetries; i++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error;
			
			// Don't retry on client errors (4xx)
			if (error && typeof error === 'object' && 'status' in error) {
				const status = error.status as number;
				if (status >= 400 && status < 500) {
					throw error;
				}
			}
			
			// Wait before retrying
			if (i < maxRetries - 1) {
				await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
			}
		}
	}
	
	throw lastError;
};