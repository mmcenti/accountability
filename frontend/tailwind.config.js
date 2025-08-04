/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px"
			}
		},
		extend: {
			// shadcn-svelte design tokens
			colors: {
				border: "hsl(var(--border) / <alpha-value>)",
				input: "hsl(var(--input) / <alpha-value>)",
				ring: "hsl(var(--ring) / <alpha-value>)",
				background: "hsl(var(--background) / <alpha-value>)",
				foreground: "hsl(var(--foreground) / <alpha-value>)",
				primary: {
					DEFAULT: "hsl(var(--primary) / <alpha-value>)",
					foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
					// Keep existing brand colors
					50: '#eff6ff',
					100: '#dbeafe',
					200: '#bfdbfe',
					300: '#93c5fd',
					400: '#60a5fa',
					500: '#3b82f6', // Main brand blue
					600: '#2563eb',
					700: '#1d4ed8',
					800: '#1e40af',
					900: '#1e3a8a',
					950: '#172554'
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
					foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
					// Keep existing brand colors
					50: '#fff7ed',
					100: '#ffedd5',
					200: '#fed7aa',
					300: '#fdba74',
					400: '#fb923c',
					500: '#f97316', // Accent orange
					600: '#ea580c',
					700: '#c2410c',
					800: '#9a3412',
					900: '#7c2d12',
					950: '#431407'
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
					foreground: "hsl(var(--destructive-foreground) / <alpha-value>)"
				},
				muted: {
					DEFAULT: "hsl(var(--muted) / <alpha-value>)",
					foreground: "hsl(var(--muted-foreground) / <alpha-value>)"
				},
				accent: {
					DEFAULT: "hsl(var(--accent) / <alpha-value>)",
					foreground: "hsl(var(--accent-foreground) / <alpha-value>)"
				},
				popover: {
					DEFAULT: "hsl(var(--popover) / <alpha-value>)",
					foreground: "hsl(var(--popover-foreground) / <alpha-value>)"
				},
				card: {
					DEFAULT: "hsl(var(--card) / <alpha-value>)",
					foreground: "hsl(var(--card-foreground) / <alpha-value>)"
				},
				// ChainForge brand colors
				success: {
					50: '#f0fdf4',
					100: '#dcfce7',
					200: '#bbf7d0',
					300: '#86efac',
					400: '#4ade80',
					500: '#22c55e',
					600: '#16a34a',
					700: '#15803d',
					800: '#166534',
					900: '#14532d',
					950: '#052e16'
				},
				warning: {
					50: '#fffbeb',
					100: '#fef3c7',
					200: '#fde68a',
					300: '#fcd34d',
					400: '#fbbf24',
					500: '#f59e0b',
					600: '#d97706',
					700: '#b45309',
					800: '#92400e',
					900: '#78350f',
					950: '#451a03'
				},
				error: {
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecaca',
					300: '#fca5a5',
					400: '#f87171',
					500: '#ef4444',
					600: '#dc2626',
					700: '#b91c1c',
					800: '#991b1b',
					900: '#7f1d1d',
					950: '#450a0a'
				},
				// Neutral grays optimized for mobile readability
				gray: {
					50: '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#9ca3af',
					500: '#6b7280',
					600: '#4b5563',
					700: '#374151',
					800: '#1f2937',
					900: '#111827',
					950: '#030712'
				}
			},

			// Typography optimized for mobile reading
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif'],
				mono: ['Fira Code', 'monospace']
			},

			// Custom spacing for mobile layouts
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem'
			},

			// Mobile-optimized screen sizes
			screens: {
				'xs': '320px',
				'sm': '375px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				// Touch-specific breakpoints
				'touch': {'raw': '(pointer: coarse)'},
				'no-touch': {'raw': '(pointer: fine)'},
				// Orientation breakpoints
				'portrait': {'raw': '(orientation: portrait)'},
				'landscape': {'raw': '(orientation: landscape)'}
			},

			// Custom animations for mobile interactions
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				'fade-in': 'fadeIn 0.5s ease-in-out',
				'fade-out': 'fadeOut 0.5s ease-in-out',
				'slide-up': 'slideUp 0.3s ease-out',
				'slide-down': 'slideDown 0.3s ease-out',
				'slide-left': 'slideLeft 0.3s ease-out',
				'slide-right': 'slideRight 0.3s ease-out',
				'bounce-gentle': 'bounceGentle 0.6s ease-in-out',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'shake': 'shake 0.5s ease-in-out',
				'progress': 'progress 2s ease-in-out infinite',
				'swipe-indicator': 'swipeIndicator 2s ease-in-out infinite'
			},

			// Custom keyframes for animations
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" }
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" }
				},
				fadeIn: {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				fadeOut: {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				slideUp: {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				slideDown: {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				slideLeft: {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				slideRight: {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				bounceGentle: {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				shake: {
					'0%, 100%': { transform: 'translateX(0)' },
					'10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-10px)' },
					'20%, 40%, 60%, 80%': { transform: 'translateX(10px)' }
				},
				progress: {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				swipeIndicator: {
					'0%, 100%': { transform: 'translateX(0)', opacity: '0.5' },
					'50%': { transform: 'translateX(20px)', opacity: '1' }
				}
			},

			// Custom shadows for mobile depth
			boxShadow: {
				'mobile': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
				'mobile-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
				'inner-mobile': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
				'focus-ring': '0 0 0 3px rgba(59, 130, 246, 0.5)'
			},

			// Border radius for modern mobile design
			borderRadius: {
				lg: "var(--radius)",
				md: "calc(var(--radius) - 2px)",
				sm: "calc(var(--radius) - 4px)",
				'4xl': '2rem',
				'5xl': '2.5rem'
			},

			// Z-index scale for layering
			zIndex: {
				'60': '60',
				'70': '70',
				'80': '80',
				'90': '90',
				'100': '100'
			},

			// Custom transitions for smooth mobile interactions
			transitionDuration: {
				'400': '400ms',
				'600': '600ms'
			},

			// Touch-friendly minimum sizes
			minHeight: {
				'touch': '44px', // iOS recommended minimum
				'button': '48px' // Material Design minimum
			},
			minWidth: {
				'touch': '44px',
				'button': '48px'
			}
		}
	},

	plugins: [
		require('@tailwindcss/forms')({
			strategy: 'class'
		}),
		require('@tailwindcss/typography'),
		
		// Custom plugin for mobile utilities
		function({ addUtilities, addComponents, theme }) {
			// Touch-friendly utilities
			addUtilities({
				'.touch-action-pan-y': {
					'touch-action': 'pan-y'
				},
				'.touch-action-pan-x': {
					'touch-action': 'pan-x'
				},
				'.touch-action-manipulation': {
					'touch-action': 'manipulation'
				},
				'.overscroll-none': {
					'overscroll-behavior': 'none'
				},
				'.overscroll-y-none': {
					'overscroll-behavior-y': 'none'
				},
				'.safe-top': {
					'padding-top': 'env(safe-area-inset-top)'
				},
				'.safe-bottom': {
					'padding-bottom': 'env(safe-area-inset-bottom)'
				},
				'.safe-left': {
					'padding-left': 'env(safe-area-inset-left)'
				},
				'.safe-right': {
					'padding-right': 'env(safe-area-inset-right)'
				}
			});

			// Mobile-first components
			addComponents({
				'.btn': {
					'@apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 min-h-button min-w-button touch-action-manipulation': {},
					'transition': 'all 0.2s ease-in-out'
				},
				'.btn-primary': {
					'@apply btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500': {}
				},
				'.btn-secondary': {
					'@apply btn bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:ring-primary-500': {}
				},
				'.btn-danger': {
					'@apply btn bg-error-600 text-white hover:bg-error-700 focus:ring-error-500': {}
				},
				'.card': {
					'@apply bg-white rounded-lg shadow-mobile border border-gray-200': {}
				},
				'.card-mobile': {
					'@apply card p-4 sm:p-6': {}
				},
				'.input': {
					'@apply block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm min-h-touch': {}
				}
			});
		}
	],

	// Dark mode configuration
	darkMode: 'class'
};