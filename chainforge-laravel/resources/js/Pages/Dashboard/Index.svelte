<script>
    import { Head, Link, router } from '@inertiajs/svelte'
    
    export let user
    export let stats

    function logout() {
        router.post('/logout')
    }
</script>

<Head title="Dashboard - ChainForge" />

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-4">
                    <h1 class="text-xl font-bold text-gray-900">🔗⚒️ ChainForge</h1>
                    <span class="text-gray-500">|</span>
                    <span class="text-gray-700">Dashboard</span>
                </div>
                
                <div class="flex items-center space-x-4">
                    <span class="text-sm text-gray-600">
                        Welcome back, {user.first_name}!
                    </span>
                    {#if user.subscription?.is_on_trial}
                        <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                            Trial Active
                        </span>
                    {/if}
                    <Link 
                        href="/subscription" 
                        class="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Subscription
                    </Link>
                    <button 
                        on:click={logout}
                        class="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                            <span class="text-white text-sm font-bold">🎯</span>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Total Goals</dt>
                            <dd class="text-lg font-medium text-gray-900">{stats.total_goals}</dd>
                        </dl>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                            <span class="text-white text-sm font-bold">✓</span>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Completed</dt>
                            <dd class="text-lg font-medium text-gray-900">{stats.completed_goals}</dd>
                        </dl>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                            <span class="text-white text-sm font-bold">👥</span>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Groups</dt>
                            <dd class="text-lg font-medium text-gray-900">{stats.active_groups}</dd>
                        </dl>
                    </div>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                            <span class="text-white text-sm font-bold">%</span>
                        </div>
                    </div>
                    <div class="ml-5 w-0 flex-1">
                        <dl>
                            <dt class="text-sm font-medium text-gray-500 truncate">Success Rate</dt>
                            <dd class="text-lg font-medium text-gray-900">{stats.completion_rate}%</dd>
                        </dl>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Personal Goals</h3>
                <p class="text-gray-600 mb-4">Track your individual progress and achievements</p>
                <div class="flex space-x-3">
                    <Link 
                        href="/goals" 
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        View Goals
                    </Link>
                    <Link 
                        href="/goals/create" 
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Create Goal
                    </Link>
                </div>
            </div>

            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Group Accountability</h3>
                <p class="text-gray-600 mb-4">Join groups for shared goals and motivation</p>
                <div class="flex space-x-3">
                    <Link 
                        href="/groups" 
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
                    >
                        View Groups
                    </Link>
                    <Link 
                        href="/groups/create" 
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Create Group
                    </Link>
                </div>
            </div>
        </div>

        <!-- Recent Activity -->
        <div class="bg-white rounded-lg shadow">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-medium text-gray-900">Recent Goals</h3>
            </div>
            <div class="p-6">
                {#if user.goals && user.goals.length > 0}
                    <div class="space-y-4">
                        {#each user.goals.slice(0, 5) as goal}
                            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div class="flex-1">
                                    <h4 class="text-sm font-medium text-gray-900">{goal.name}</h4>
                                    <p class="text-xs text-gray-500 mt-1">
                                        {goal.current_amount} / {goal.target_amount} {goal.unit}
                                    </p>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <div class="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                            style="width: {goal.completion_percentage}%"
                                        ></div>
                                    </div>
                                    <span class="text-xs text-gray-500 w-10 text-right">
                                        {Math.round(goal.completion_percentage)}%
                                    </span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <div class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">🎯</div>
                        <h3 class="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
                        <p class="text-gray-500 mb-4">Create your first goal to start tracking your progress!</p>
                        <Link 
                            href="/goals/create"
                            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            Create Your First Goal
                        </Link>
                    </div>
                {/if}
            </div>
        </div>
    </main>
</div>