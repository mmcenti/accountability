<script>
    import { Head, Link, router, useForm } from '@inertiajs/svelte'
    import { onMount } from 'svelte'
    
    export let subscription = null
    export let is_on_free_trial = false
    export let trial_ends_at = null
    export let payment_methods = []
    export let setup_intent = null
    export let stripe_key = null
    export let plans = {}
    export let has_ever_subscribed = false

    let stripe = null
    let elements = null
    let cardElement = null
    let processing = false
    let showPaymentForm = false

    // Form for starting free trial
    const freeTrialForm = useForm({})

    // Form for subscribing with payment
    const subscribeForm = useForm({
        payment_method: ''
    })

    onMount(async () => {
        if (stripe_key && window.Stripe) {
            stripe = window.Stripe(stripe_key)
        }
    })

    async function startFreeTrial() {
        freeTrialForm.post('/subscription/free-trial')
    }

    async function showPaymentSetup() {
        showPaymentForm = true
        
        if (stripe && setup_intent) {
            elements = stripe.elements()
            cardElement = elements.create('card', {
                style: {
                    base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                },
            })
            
            // Wait for next tick to ensure DOM is ready
            setTimeout(() => {
                cardElement.mount('#card-element')
            }, 100)
        }
    }

    async function handleSubscription() {
        if (!stripe || !elements) return
        
        processing = true

        const { error, setupIntent } = await stripe.confirmSetup({
            elements,
            confirmParams: {
                return_url: window.location.origin + '/subscription',
            },
            redirect: 'if_required'
        })

        if (error) {
            processing = false
            console.error('Payment setup failed:', error)
            return
        }

        subscribeForm.payment_method = setupIntent.payment_method
        subscribeForm.post('/subscription/subscribe', {
            onFinish: () => {
                processing = false
                showPaymentForm = false
            }
        })
    }

    function cancelSubscription() {
        if (confirm('Are you sure you want to cancel your subscription? You will continue to have access until the end of your billing period.')) {
            router.post('/subscription/cancel')
        }
    }

    function resumeSubscription() {
        router.post('/subscription/resume')
    }

    function openBillingPortal() {
        window.location.href = '/subscription/billing-portal'
    }

    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    function getDaysRemaining(endDate) {
        const end = new Date(endDate)
        const now = new Date()
        const diffTime = end - now
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return Math.max(0, diffDays)
    }
</script>

<Head title="Subscription - ChainForge" />

<!-- Load Stripe.js -->
<script src="https://js.stripe.com/v3/"></script>

<div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center space-x-4">
                    <Link href="/dashboard" class="text-xl font-bold text-gray-900">🔗⚒️ ChainForge</Link>
                    <span class="text-gray-500">|</span>
                    <h1 class="text-xl font-semibold text-gray-900">Subscription</h1>
                </div>
                
                <Link href="/dashboard" class="text-sm text-gray-600 hover:text-gray-900">
                    ← Back to Dashboard
                </Link>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {#if is_on_free_trial && !subscription}
            <!-- Free Trial Status -->
            <div class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-medium text-green-900 mb-2">🎉 You're on a Free Trial!</h3>
                        <p class="text-green-700">
                            Enjoy full access to ChainForge Premium features. 
                            Your trial ends on {formatDate(trial_ends_at)} 
                            ({getDaysRemaining(trial_ends_at)} days remaining).
                        </p>
                    </div>
                    <button 
                        on:click={showPaymentSetup}
                        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                        Upgrade Now
                    </button>
                </div>
            </div>
        {:else if !subscription && !has_ever_subscribed}
            <!-- Start Free Trial -->
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8 text-center">
                <div class="text-blue-600 text-4xl mb-4">🚀</div>
                <h3 class="text-2xl font-bold text-blue-900 mb-4">Start Your Free Trial</h3>
                <p class="text-blue-700 mb-6 max-w-2xl mx-auto">
                    Get 30 days of full access to ChainForge Premium - no credit card required! 
                    Experience unlimited goals, group accountability, and advanced features.
                </p>
                
                <button 
                    on:click={startFreeTrial}
                    disabled={freeTrialForm.processing}
                    class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 text-lg font-medium disabled:opacity-50"
                >
                    {freeTrialForm.processing ? 'Starting Trial...' : 'Start 30-Day Free Trial'}
                </button>
                
                <p class="text-xs text-blue-600 mt-4">
                    Cancel anytime during trial • No commitment • No hidden fees
                </p>
            </div>
        {/if}

        {#if subscription}
            <!-- Active Subscription Status -->
            <div class="bg-white rounded-lg shadow-sm border p-6 mb-8">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Subscription Status</h3>
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium {subscription.active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        {subscription.on_trial ? 'Trial' : subscription.active ? 'Active' : subscription.canceled ? 'Canceled' : 'Inactive'}
                    </span>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h4 class="text-sm font-medium text-gray-500 mb-1">Plan</h4>
                        <p class="text-lg text-gray-900">ChainForge Premium</p>
                    </div>
                    
                    {#if subscription.on_trial}
                        <div>
                            <h4 class="text-sm font-medium text-gray-500 mb-1">Trial Ends</h4>
                            <p class="text-lg text-gray-900">{formatDate(subscription.trial_ends_at)}</p>
                        </div>
                    {:else if subscription.ends_at}
                        <div>
                            <h4 class="text-sm font-medium text-gray-500 mb-1">
                                {subscription.canceled ? 'Access Ends' : 'Next Billing'}
                            </h4>
                            <p class="text-lg text-gray-900">{formatDate(subscription.ends_at)}</p>
                        </div>
                    {/if}
                </div>

                <div class="mt-6 flex space-x-4">
                    {#if subscription.canceled && subscription.on_grace_period}
                        <button 
                            on:click={resumeSubscription}
                            class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                            Resume Subscription
                        </button>
                    {:else if subscription.active && !subscription.on_trial}
                        <button 
                            on:click={cancelSubscription}
                            class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm font-medium"
                        >
                            Cancel Subscription
                        </button>
                    {/if}
                    
                    {#if subscription.active && !subscription.on_trial}
                        <button 
                            on:click={openBillingPortal}
                            class="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm font-medium"
                        >
                            Manage Billing
                        </button>
                    {/if}
                </div>
            </div>
        {/if}

        <!-- Payment Form Modal -->
        {#if showPaymentForm}
            <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold text-gray-900">Subscribe to Premium</h3>
                        <button 
                            on:click={() => showPaymentForm = false}
                            class="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>
                    
                    <div class="mb-6">
                        <p class="text-gray-600 mb-4">Enter your payment information to continue with ChainForge Premium.</p>
                        
                        <div class="border rounded-lg p-4">
                            <div id="card-element" class="min-h-[40px]"></div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-4">
                        <button 
                            on:click={() => showPaymentForm = false}
                            class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            on:click={handleSubscription}
                            disabled={processing}
                            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {processing ? 'Processing...' : 'Subscribe ($9.99/month)'}
                        </button>
                    </div>
                </div>
            </div>
        {/if}

        <!-- Pricing Plans -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Free Plan -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
                <div class="text-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">{plans.free.name}</h3>
                    <div class="text-3xl font-bold text-gray-900 mb-1">
                        ${plans.free.price}
                    </div>
                    <p class="text-gray-500">Forever free</p>
                </div>
                
                <ul class="space-y-3 mb-6">
                    {#each plans.free.features as feature}
                        <li class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✓</span>
                            {feature}
                        </li>
                    {/each}
                </ul>
                
                <div class="mb-4">
                    <p class="text-xs font-medium text-gray-500 mb-2">LIMITATIONS:</p>
                    <ul class="space-y-1">
                        {#each plans.free.limitations as limitation}
                            <li class="flex items-center text-xs text-gray-400">
                                <span class="text-gray-300 mr-2">✗</span>
                                {limitation}
                            </li>
                        {/each}
                    </ul>
                </div>
                
                <button 
                    disabled
                    class="w-full bg-gray-100 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
                >
                    Current Plan
                </button>
            </div>

            <!-- Premium Plan -->
            <div class="bg-white rounded-lg shadow-sm border-2 border-blue-500 p-6 relative">
                {#if plans.premium.popular}
                    <div class="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span class="bg-blue-500 text-white px-4 py-1 rounded-full text-xs font-medium">
                            Most Popular
                        </span>
                    </div>
                {/if}
                
                <div class="text-center mb-6">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">{plans.premium.name}</h3>
                    <div class="text-3xl font-bold text-gray-900 mb-1">
                        ${plans.premium.price}
                    </div>
                    <p class="text-gray-500">per {plans.premium.interval}</p>
                </div>
                
                <ul class="space-y-3 mb-8">
                    {#each plans.premium.features as feature}
                        <li class="flex items-center text-sm text-gray-600">
                            <span class="text-green-500 mr-2">✓</span>
                            {feature}
                        </li>
                    {/each}
                </ul>
                
                {#if !subscription || !subscription.active}
                    {#if !is_on_free_trial && !has_ever_subscribed}
                        <button 
                            on:click={startFreeTrial}
                            disabled={freeTrialForm.processing}
                            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                        >
                            {freeTrialForm.processing ? 'Starting...' : 'Start Free Trial'}
                        </button>
                    {:else}
                        <button 
                            on:click={showPaymentSetup}
                            class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium"
                        >
                            Subscribe Now
                        </button>
                    {/if}
                {:else}
                    <button 
                        disabled
                        class="w-full bg-green-100 text-green-700 px-4 py-2 rounded-lg cursor-not-allowed font-medium"
                    >
                        ✓ Active Plan
                    </button>
                {/if}
            </div>
        </div>

        <!-- Feature Comparison -->
        <div class="mt-12 bg-white rounded-lg shadow-sm border p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-6">Why Upgrade to Premium?</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="text-center">
                    <div class="text-3xl mb-3">👥</div>
                    <h4 class="font-medium text-gray-900 mb-2">Group Accountability</h4>
                    <p class="text-sm text-gray-600">Join groups with shared goals and real peer pressure to stay motivated.</p>
                </div>
                
                <div class="text-center">
                    <div class="text-3xl mb-3">🔥</div>
                    <h4 class="font-medium text-gray-900 mb-2">Penalty Carry-Over</h4>
                    <p class="text-sm text-gray-600">Miss your target? The deficit automatically carries to next period.</p>
                </div>
                
                <div class="text-center">
                    <div class="text-3xl mb-3">📊</div>
                    <h4 class="font-medium text-gray-900 mb-2">Advanced Analytics</h4>
                    <p class="text-sm text-gray-600">Deep insights into your progress patterns and goal completion rates.</p>
                </div>
            </div>
        </div>
    </main>
</div>