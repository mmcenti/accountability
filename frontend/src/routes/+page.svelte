<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/auth';
	import { ChevronRightIcon, UserGroupIcon, TargetIcon, FireIcon } from '@heroicons/svelte/24/outline';

	// Redirect to dashboard if already authenticated
	$: if ($authStore.isAuthenticated) {
		goto('/dashboard');
	}

	let heroRef: HTMLElement;
	let featuresRef: HTMLElement;

	onMount(() => {
		// Intersection Observer for animations
		if (browser && 'IntersectionObserver' in window) {
			const observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							entry.target.classList.add('animate-fade-in');
						}
					});
				},
				{ threshold: 0.1 }
			);

			if (heroRef) observer.observe(heroRef);
			if (featuresRef) observer.observe(featuresRef);

			return () => observer.disconnect();
		}
	});

	const features = [
		{
			icon: TargetIcon,
			title: 'Personal Goals',
			description: 'Track your individual goals with detailed progress monitoring and analytics.'
		},
		{
			icon: UserGroupIcon,
			title: 'Group Accountability',
			description: 'Join groups where everyone works toward shared objectives with real peer pressure.'
		},
		{
			icon: FireIcon,
			title: 'Penalty Carry-Over',
			description: 'Miss your weekly target? The deficit gets added to next week for ultimate accountability.'
		}
	];
</script>

<svelte:head>
	<title>ChainForge - Goal Tracking with Accountability</title>
	<meta name="description" content="Achieve your goals through personal discipline and group accountability. Join groups, track progress, and experience real peer pressure through our penalty carry-over system." />
</svelte:head>

<!-- Hero Section -->
<section 
	bind:this={heroRef}
	class="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden"
>
	<!-- Background pattern -->
	<div class="absolute inset-0 bg-black bg-opacity-20"></div>
	<div class="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10"></div>
	
	<div class="relative z-10 max-w-4xl mx-auto px-4 text-center">
		<!-- Logo/Brand -->
		<div class="mb-8">
			<div class="flex items-center justify-center mb-4">
				<div class="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
					<span class="text-3xl font-bold text-white">🔗⚒️</span>
				</div>
			</div>
			<h1 class="text-4xl md:text-6xl font-bold mb-4 leading-tight">
				<span class="block">ChainForge</span>
				<span class="block text-2xl md:text-4xl font-medium text-primary-200 mt-2">
					Forge Your Future
				</span>
			</h1>
		</div>

		<!-- Hero message -->
		<div class="mb-12 space-y-6">
			<p class="text-xl md:text-2xl font-medium leading-relaxed">
				Achieve your goals through 
				<span class="text-secondary-400 font-semibold">personal discipline</span> and 
				<span class="text-secondary-400 font-semibold">group accountability</span>
			</p>
			
			<p class="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
				Join accountability groups, track progress, and experience real peer pressure 
				through our unique penalty carry-over system.
			</p>
		</div>

		<!-- CTA Buttons -->
		<div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
			<a 
				href="/register"
				class="btn-primary text-lg px-8 py-4 bg-secondary-500 hover:bg-secondary-600 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center group w-full sm:w-auto justify-center"
			>
				Start Your Journey
				<ChevronRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
			</a>
			
			<a 
				href="/login"
				class="btn-secondary text-lg px-8 py-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-xl backdrop-blur-sm border border-white border-opacity-30 transition-all duration-200 w-full sm:w-auto justify-center"
			>
				Sign In
			</a>
			
			<a 
				href="/demo"
				class="text-sm text-primary-200 hover:text-white underline underline-offset-4 transition-colors duration-200"
			>
				View Component Demo →
			</a>
		</div>

		<!-- Social proof -->
		<div class="text-primary-200">
			<p class="text-sm">🔥 30-day free trial • 📱 Mobile-first design • 🚀 Join groups instantly</p>
		</div>
	</div>

	<!-- Scroll indicator -->
	<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
		<div class="w-6 h-10 border-2 border-white border-opacity-50 rounded-full flex justify-center">
			<div class="w-1 h-3 bg-white bg-opacity-70 rounded-full mt-2 animate-pulse"></div>
		</div>
	</div>
</section>

<!-- Features Section -->
<section bind:this={featuresRef} class="py-20 bg-white">
	<div class="max-w-6xl mx-auto px-4">
		<!-- Section header -->
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
				How ChainForge Works
			</h2>
			<p class="text-xl text-gray-600 max-w-3xl mx-auto">
				Our unique approach combines individual goal tracking with group accountability 
				to create the ultimate motivation system.
			</p>
		</div>

		<!-- Features grid -->
		<div class="grid md:grid-cols-3 gap-8 md:gap-12">
			{#each features as feature, index}
				<div 
					class="text-center group hover:transform hover:scale-105 transition-all duration-300"
					style="animation-delay: {index * 200}ms"
				>
					<!-- Icon -->
					<div class="relative mb-6">
						<div class="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
							<svelte:component 
								this={feature.icon} 
								class="w-10 h-10 text-white"
							/>
						</div>
						<div class="absolute -inset-4 bg-primary-100 rounded-3xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
					</div>
					
					<!-- Content -->
					<h3 class="text-xl font-bold text-gray-900 mb-4">
						{feature.title}
					</h3>
					<p class="text-gray-600 leading-relaxed">
						{feature.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<!-- How it Works Section -->
<section class="py-20 bg-gray-50">
	<div class="max-w-4xl mx-auto px-4">
		<div class="text-center mb-16">
			<h2 class="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
				The Accountability Advantage
			</h2>
			<p class="text-xl text-gray-600">
				Experience the power of penalty carry-over and group pressure
			</p>
		</div>

		<div class="space-y-12">
			<!-- Step 1 -->
			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1 order-2 md:order-1">
					<div class="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
						Step 1
					</div>
					<h3 class="text-2xl font-bold text-gray-900 mb-4">Set Your Goals</h3>
					<p class="text-gray-600 text-lg leading-relaxed">
						Create personal goals or join accountability groups. Set weekly targets and 
						choose your measurement units. The more specific, the better the results.
					</p>
				</div>
				<div class="flex-1 order-1 md:order-2">
					<div class="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-8 text-white text-center">
						<TargetIcon class="w-16 h-16 mx-auto mb-4" />
						<p class="font-medium">Goal: Run 20 miles/week</p>
					</div>
				</div>
			</div>

			<!-- Step 2 -->
			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1">
					<div class="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-8 text-white text-center">
						<UserGroupIcon class="w-16 h-16 mx-auto mb-4" />
						<p class="font-medium">Group: 5 runners tracking together</p>
					</div>
				</div>
				<div class="flex-1">
					<div class="bg-secondary-100 text-secondary-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
						Step 2
					</div>
					<h3 class="text-2xl font-bold text-gray-900 mb-4">Join Forces</h3>
					<p class="text-gray-600 text-lg leading-relaxed">
						Work together with like-minded people. See everyone's progress in real-time 
						and compete on group leaderboards for extra motivation.
					</p>
				</div>
			</div>

			<!-- Step 3 -->
			<div class="flex flex-col md:flex-row items-center gap-8">
				<div class="flex-1 order-2 md:order-1">
					<div class="bg-error-100 text-error-800 text-sm font-medium px-3 py-1 rounded-full inline-block mb-4">
						Step 3
					</div>
					<h3 class="text-2xl font-bold text-gray-900 mb-4">Experience Real Accountability</h3>
					<p class="text-gray-600 text-lg leading-relaxed">
						Miss your weekly target? The deficit automatically carries over to next week. 
						This creates real pressure and ensures you never fall too far behind.
					</p>
				</div>
				<div class="flex-1 order-1 md:order-2">
					<div class="bg-gradient-to-br from-error-500 to-error-600 rounded-2xl p-8 text-white text-center">
						<FireIcon class="w-16 h-16 mx-auto mb-4" />
						<p class="font-medium">Missed 5 miles? Now you need 25 next week!</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<!-- CTA Section -->
<section class="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
	<div class="max-w-4xl mx-auto px-4 text-center">
		<h2 class="text-3xl md:text-5xl font-bold mb-6">
			Ready to Forge Your Future?
		</h2>
		<p class="text-xl mb-8 text-primary-100">
			Join thousands of people achieving their goals through accountability
		</p>
		
		<div class="flex flex-col sm:flex-row gap-4 justify-center">
			<a 
				href="/register"
				class="btn-primary text-lg px-8 py-4 bg-secondary-500 hover:bg-secondary-600 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center group w-full sm:w-auto justify-center"
			>
				Start Free Trial
				<ChevronRightIcon class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
			</a>
		</div>

		<p class="text-sm text-primary-200 mt-6">
			✨ No credit card required • Cancel anytime • Full access for 30 days
		</p>
	</div>
</section>

<style>
	.animate-fade-in {
		animation: fadeInUp 0.8s ease-out forwards;
	}
	
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>