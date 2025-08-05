<script>
    import { Head, Link, router } from '@inertiajs/svelte'
    
    export let goals = []

    const categories = {
        fitness: { icon: '💪', name: 'Fitness & Exercise', color: 'bg-red-100 text-red-800' },
        health: { icon: '🏥', name: 'Health & Wellness', color: 'bg-green-100 text-green-800' },
        education: { icon: '📚', name: 'Education & Learning', color: 'bg-blue-100 text-blue-800' },
        career: { icon: '💼', name: 'Career & Professional', color: 'bg-purple-100 text-purple-800' },
        finance: { icon: '💰', name: 'Finance & Money', color: 'bg-yellow-100 text-yellow-800' },
        hobbies: { icon: '🎨', name: 'Hobbies & Interests', color: 'bg-pink-100 text-pink-800' },
        relationship: { icon: '❤️', name: 'Relationships', color: 'bg-rose-100 text-rose-800' },
        personal: { icon: '🌱', name: 'Personal Development', color: 'bg-indigo-100 text-indigo-800' },
        other: { icon: '📋', name: 'Other', color: 'bg-gray-100 text-gray-800' }
    }

    function getStatusColor(status) {
        switch(status) {
            case 'completed': return 'bg-green-100 text-green-800'
            case 'active': return 'bg-blue-100 text-blue-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'canceled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
    }

    function deleteGoal(goalId) {
        if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
            router.delete(`/goals/${goalId}`)
        }
    }
</script>

<Head title="My Goals - ChainForge" />

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-4">
                    <Link href="/dashboard" class="text-xl font-bold text-gray-900">🔗⚒️ ChainForge</Link>
                    <span class="text-gray-500">|</span>
                    <h1 class="text-xl font-semibold text-gray-900">My Goals</h1>
                </div>
                
                <div class="flex items-center space-x-4">
                    <Link 
                        href="/goals/discover" 
                        class="text-sm text-gray-600 hover:text-gray-900"
                    >
                        Discover Goals
                    </Link>
                    <Link 
                        href="/goals/create" 
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        Create Goal
                    </Link>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {#if goals.length === 0}
            <!-- Empty State -->
            <div class="text-center py-12">
                <div class="text-gray-400 text-6xl mb-4">🎯</div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
                <p class="text-gray-500 mb-8">Create your first goal to start tracking your progress and achieving your dreams!</p>
                
                <div class="max-w-md mx-auto space-y-4">
                    <Link 
                        href="/goals/create"
                        class="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                        🚀 Create Your First Goal
                    </Link>
                    
                    <Link 
                        href="/goals/discover"
                        class="w-full inline-flex justify-center items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        🔍 Discover Popular Goals
                    </Link>
                </div>
                
                <div class="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="text-3xl mb-3">📈</div>
                        <h4 class="font-semibold text-gray-900 mb-2">Track Progress</h4>
                        <p class="text-sm text-gray-600">Log daily progress and watch your achievements grow over time.</p>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="text-3xl mb-3">🏆</div>
                        <h4 class="font-semibold text-gray-900 mb-2">Achieve More</h4>
                        <p class="text-sm text-gray-600">Set clear targets and deadlines to stay motivated and focused.</p>
                    </div>
                    
                    <div class="bg-white p-6 rounded-lg shadow-sm border">
                        <div class="text-3xl mb-3">👥</div>
                        <h4 class="font-semibold text-gray-900 mb-2">Share Success</h4>
                        <p class="text-sm text-gray-600">Make goals public to inspire others and build accountability.</p>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Goals Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {#each goals as goal (goal.id)}
                    <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                        <!-- Goal Header -->
                        <div class="p-6">
                            <div class="flex items-start justify-between mb-4">
                                <div class="flex items-center space-x-2">
                                    <span class="text-2xl">{categories[goal.category]?.icon || '📋'}</span>
                                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {categories[goal.category]?.color || 'bg-gray-100 text-gray-800'}">
                                        {categories[goal.category]?.name || 'Other'}
                                    </span>
                                </div>
                                
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getStatusColor(goal.status)}">
                                    {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                                </span>
                            </div>
                            
                            <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                                {goal.name}
                            </h3>
                            
                            {#if goal.description}
                                <p class="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {goal.description}
                                </p>
                            {/if}
                        </div>

                        <!-- Progress Section -->
                        <div class="px-6 pb-4">
                            <div class="flex items-center justify-between text-sm text-gray-600 mb-2">
                                <span>Progress</span>
                                <span>{goal.current_amount} / {goal.target_amount} {goal.unit}</span>
                            </div>
                            
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
                                <div 
                                    class="h-2 rounded-full transition-all duration-300 {goal.is_completed ? 'bg-green-500' : 'bg-blue-600'}"
                                    style="width: {Math.min(goal.completion_percentage, 100)}%"
                                ></div>
                            </div>
                            
                            <div class="flex items-center justify-between text-xs text-gray-500">
                                <span>
                                    {Math.round(goal.completion_percentage)}% complete
                                </span>
                                <span>
                                    {goal.progress_count} entries
                                </span>
                            </div>
                        </div>

                        <!-- Goal Footer -->
                        <div class="px-6 py-4 bg-gray-50 rounded-b-lg">
                            <div class="flex items-center justify-between">
                                <div class="text-xs text-gray-500">
                                    {#if goal.end_date}
                                        Due: {formatDate(goal.end_date)}
                                    {:else}
                                        Started: {formatDate(goal.start_date)}
                                    {/if}
                                </div>
                                
                                <div class="flex items-center space-x-2">
                                    <Link 
                                        href="/goals/{goal.id}" 
                                        class="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        View
                                    </Link>
                                    <Link 
                                        href="/goals/{goal.id}/edit" 
                                        class="text-xs text-gray-600 hover:text-gray-700"
                                    >
                                        Edit
                                    </Link>
                                    <button 
                                        on:click={() => deleteGoal(goal.id)}
                                        class="text-xs text-red-600 hover:text-red-700"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Summary Stats -->
            <div class="mt-12 bg-white rounded-lg shadow-sm border p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Your Goal Summary</h3>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="text-center">
                        <div class="text-2xl font-bold text-blue-600">
                            {goals.length}
                        </div>
                        <div class="text-sm text-gray-600">Total Goals</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold text-green-600">
                            {goals.filter(g => g.is_completed).length}
                        </div>
                        <div class="text-sm text-gray-600">Completed</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold text-yellow-600">
                            {goals.filter(g => g.status === 'active' && !g.is_completed).length}
                        </div>
                        <div class="text-sm text-gray-600">In Progress</div>
                    </div>
                    
                    <div class="text-center">
                        <div class="text-2xl font-bold text-purple-600">
                            {Math.round(goals.reduce((sum, g) => sum + g.completion_percentage, 0) / (goals.length || 1))}%
                        </div>
                        <div class="text-sm text-gray-600">Avg. Progress</div>
                    </div>
                </div>
            </div>
        {/if}
    </main>
</div>

<style>
    .line-clamp-2 {
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
</style>