import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	
	// Development server configuration for mobile testing
	server: {
		host: '0.0.0.0',
		port: 5173,
		strictPort: true,
		// Enable network access for mobile devices
		cors: true,
		// Hot reload configuration
		hmr: {
			port: 5174
		}
	},
	
	// Preview server configuration
	preview: {
		host: '0.0.0.0',
		port: 4173,
		strictPort: true,
		cors: true
	},

	// Build optimizations
	build: {
		// Enable source maps for debugging
		sourcemap: true,
		// Optimize for mobile
		target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
		// Bundle size optimizations
		rollupOptions: {
			output: {
				// Separate vendor chunks for better caching
				manualChunks: {
					vendor: ['svelte', '@sveltejs/kit'],
					charts: ['chart.js', 'chartjs-adapter-date-fns'],
					utils: ['date-fns', 'uuid', 'zod']
				}
			}
		},
		// Compress assets
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true
			}
		}
	},

	// Dependency pre-bundling
	optimizeDeps: {
		include: [
			'chart.js',
			'date-fns',
			'sortablejs',
			'uuid',
			'lucide-svelte',
			'clsx',
			'tailwind-merge'
		]
	},

	// CSS preprocessing
	css: {
		postcss: './postcss.config.js'
	},

	// Testing configuration
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		globals: true,
		setupFiles: ['src/lib/test-setup.ts']
	},

	// Define global constants
	define: {
		// API URL for different environments
		__API_URL__: JSON.stringify(
			process.env.NODE_ENV === 'production' 
				? 'https://api.chainforge.app' 
				: 'http://localhost:8080'
		),
		// Enable debug mode in development
		__DEBUG__: JSON.stringify(process.env.NODE_ENV === 'development'),
		// App version
		__VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
	},

	// Environment variables prefix
	envPrefix: 'VITE_',

	// Worker configuration for PWA
	worker: {
		format: 'es'
	}
});