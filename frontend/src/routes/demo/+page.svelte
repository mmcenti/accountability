<script lang="ts">
	import {
		Button,
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		CardFooter,
		Input
	} from "$lib/components/ui";
	import { Check, Star, Heart } from "lucide-svelte";

	let email = "";
	let theme = "light";

	function toggleTheme() {
		theme = theme === "light" ? "dark" : "light";
		document.documentElement.classList.toggle("dark");
	}
</script>

<svelte:head>
	<title>shadcn-svelte Demo - ChainForge</title>
</svelte:head>

<div class="container mx-auto p-6 space-y-8">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-4xl font-bold tracking-tight">shadcn-svelte Demo</h1>
			<p class="text-muted-foreground">Showcase of shadcn-svelte components integrated with ChainForge</p>
		</div>
		<Button variant="outline" on:click={toggleTheme}>
			Toggle {theme === "light" ? "Dark" : "Light"} Mode
		</Button>
	</div>

	<!-- Button Variants Demo -->
	<Card>
		<CardHeader>
			<CardTitle>Button Components</CardTitle>
			<CardDescription>Different button variants and sizes</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="flex flex-wrap gap-2">
				<Button>Default</Button>
				<Button variant="secondary">Secondary</Button>
				<Button variant="outline">Outline</Button>
				<Button variant="ghost">Ghost</Button>
				<Button variant="destructive">Destructive</Button>
				<Button variant="link">Link</Button>
			</div>
			
			<div class="flex flex-wrap gap-2 items-center">
				<Button size="sm">Small</Button>
				<Button size="default">Default</Button>
				<Button size="lg">Large</Button>
				<Button size="icon"><Heart class="h-4 w-4" /></Button>
			</div>

			<div class="flex gap-2">
				<Button disabled>Disabled</Button>
				<Button>
					<Check class="mr-2 h-4 w-4" />
					With Icon
				</Button>
			</div>
		</CardContent>
	</Card>

	<!-- Input Demo -->
	<Card>
		<CardHeader>
			<CardTitle>Input Components</CardTitle>
			<CardDescription>Form inputs with shadcn styling</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="space-y-2">
				<label for="email" class="text-sm font-medium">Email</label>
				<Input
					id="email"
					type="email"
					placeholder="Enter your email"
					bind:value={email}
				/>
			</div>
			
			<div class="space-y-2">
				<label for="password" class="text-sm font-medium">Password</label>
				<Input
					id="password"
					type="password"
					placeholder="Enter your password"
				/>
			</div>

			<div class="space-y-2">
				<label for="disabled" class="text-sm font-medium">Disabled Input</label>
				<Input
					id="disabled"
					placeholder="This is disabled"
					disabled
				/>
			</div>
		</CardContent>
	</Card>

	<!-- Card Variants Demo -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle class="flex items-center gap-2">
					<Star class="h-5 w-5 text-yellow-500" />
					Goal Progress
				</CardTitle>
				<CardDescription>Track your daily objectives</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">7/10</div>
				<p class="text-xs text-muted-foreground">goals completed today</p>
				<div class="mt-4 w-full bg-secondary rounded-full h-2">
					<div class="bg-primary h-2 rounded-full" style="width: 70%"></div>
				</div>
			</CardContent>
			<CardFooter>
				<Button class="w-full">View Details</Button>
			</CardFooter>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Team Challenges</CardTitle>
				<CardDescription>Connect with friends and colleagues</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="flex items-center space-x-4">
					<div class="flex -space-x-2">
						<div class="w-8 h-8 bg-primary rounded-full border-2 border-background"></div>
						<div class="w-8 h-8 bg-secondary rounded-full border-2 border-background"></div>
						<div class="w-8 h-8 bg-accent rounded-full border-2 border-background"></div>
					</div>
					<span class="text-sm text-muted-foreground">+5 more</span>
				</div>
			</CardContent>
			<CardFooter class="flex gap-2">
				<Button variant="outline" size="sm">Join</Button>
				<Button variant="ghost" size="sm">Learn More</Button>
			</CardFooter>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Streak Counter</CardTitle>
				<CardDescription>Keep your momentum going</CardDescription>
			</CardHeader>
			<CardContent>
				<div class="text-center">
					<div class="text-3xl font-bold text-primary">🔥</div>
					<div class="text-xl font-semibold">15 days</div>
					<p class="text-sm text-muted-foreground">Personal best: 23 days</p>
				</div>
			</CardContent>
			<CardFooter>
				<Button variant="secondary" class="w-full">Share Achievement</Button>
			</CardFooter>
		</Card>
	</div>

	<!-- Newsletter Signup Example -->
	<Card class="max-w-md mx-auto">
		<CardHeader>
			<CardTitle>Stay Updated</CardTitle>
			<CardDescription>Get the latest ChainForge updates and tips</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<Input
				type="email"
				placeholder="your@email.com"
				bind:value={email}
			/>
		</CardContent>
		<CardFooter>
			<Button class="w-full">Subscribe</Button>
		</CardFooter>
	</Card>
</div>