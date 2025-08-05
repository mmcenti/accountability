<script>
    import { Head, Link } from '@inertiajs/svelte'
    
    export let title = 'ChainForge'
</script>

<Head title={title} />

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full space-y-8 text-center">
        <div>
            <h1 class="text-6xl font-bold text-gray-900 mb-2">🔗⚒️</h1>
            <h2 class="text-3xl font-bold text-gray-900 mb-4">ChainForge</h2>
            <p class="text-gray-600 text-lg mb-8">
                A modern, mobile-first goal tracking application with innovative group accountability features.
            </p>
        </div>
        
        <div class="space-y-4">
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">🎯 Personal Goals</h3>
                <p class="text-gray-600">Track your individual goals with detailed progress monitoring</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">👥 Group Accountability</h3>
                <p class="text-gray-600">Join groups with shared goals and real peer pressure</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow-md">
                <h3 class="text-xl font-semibold text-gray-900 mb-2">🔥 Penalty Carry-Over</h3>
                <p class="text-gray-600">Miss your target? The deficit carries to next week</p>
            </div>
        </div>
        
        <div class="pt-8 space-y-3">
            <Link href="/register" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors block text-center">
                Get Started - Free Trial
            </Link>
            <Link href="/login" class="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors border border-gray-300 block text-center">
                Sign In
            </Link>
        </div>
        
        <div class="text-sm text-gray-500">
            <p>Built with Laravel, Inertia.js, Svelte & Tailwind CSS</p>
        </div>
    </div>
</div>