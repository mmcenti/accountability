<script>
    import { Head, Link, useForm } from '@inertiajs/svelte'
    
    const form = useForm({
        email: '',
        password: '',
        remember: false
    })

    function submit() {
        $form.post('/login', {
            onFinish: () => {
                $form.reset('password')
            }
        })
    }
</script>

<Head title="Login - ChainForge" />

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
        <div class="bg-white rounded-lg shadow-lg p-8">
            <div class="text-center mb-8">
                <h1 class="text-3xl font-bold text-gray-900">🔗⚒️</h1>
                <h2 class="text-2xl font-bold text-gray-900 mt-2">Welcome Back</h2>
                <p class="text-gray-600 mt-2">Sign in to your ChainForge account</p>
            </div>

            <form on:submit|preventDefault={submit} class="space-y-6">
                <div>
                    <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <input 
                        id="email"
                        type="email" 
                        bind:value={$form.email}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        class:border-red-500={$form.errors.email}
                        required
                    />
                    {#if $form.errors.email}
                        <p class="mt-1 text-sm text-red-600">{$form.errors.email}</p>
                    {/if}
                </div>

                <div>
                    <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>
                    <input 
                        id="password"
                        type="password" 
                        bind:value={$form.password}
                        class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        class:border-red-500={$form.errors.password}
                        required
                    />
                    {#if $form.errors.password}
                        <p class="mt-1 text-sm text-red-600">{$form.errors.password}</p>
                    {/if}
                </div>

                <div class="flex items-center justify-between">
                    <label class="flex items-center">
                        <input 
                            type="checkbox" 
                            bind:checked={$form.remember}
                            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span class="ml-2 block text-sm text-gray-700">Remember me</span>
                    </label>
                    
                    <a href="#" class="text-sm text-blue-600 hover:text-blue-500">
                        Forgot password?
                    </a>
                </div>

                <button 
                    type="submit" 
                    disabled={$form.processing}
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {#if $form.processing}
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                    {:else}
                        Sign In
                    {/if}
                </button>
            </form>

            <div class="mt-6 text-center">
                <p class="text-sm text-gray-600">
                    Don't have an account? 
                    <Link href="/register" class="font-medium text-blue-600 hover:text-blue-500">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    </div>
</div>