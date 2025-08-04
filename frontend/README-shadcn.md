# shadcn-svelte Integration Guide

This document outlines how to use the shadcn-svelte components that have been integrated into the ChainForge frontend.

## 🎯 Overview

We've successfully integrated **shadcn-svelte** components with the existing Tailwind CSS setup in ChainForge. This provides:

- ✅ Modern, accessible UI components
- ✅ Consistent design system
- ✅ Full compatibility with existing Tailwind configuration
- ✅ Dark mode support
- ✅ Mobile-first responsive design

## 🚀 Getting Started

### Available Components

The following shadcn-svelte components are ready to use:

- **Button** - Primary, secondary, outline, ghost, destructive, and link variants
- **Card** - Card container with header, title, description, content, and footer
- **Input** - Form inputs with proper styling and states
- **Plus more coming soon!**

### Basic Usage

```svelte
<script>
	import { Button, Card, CardHeader, CardTitle, Input } from "$lib/components/ui";
</script>

<Card>
	<CardHeader>
		<CardTitle>Welcome to ChainForge</CardTitle>
	</CardHeader>
	<CardContent>
		<Input placeholder="Enter your goal..." />
		<Button>Save Goal</Button>
	</CardContent>
</Card>
```

## 📖 Component Documentation

### Button Component

The Button component supports multiple variants and sizes:

```svelte
<script>
	import { Button } from "$lib/components/ui";
	import { Check } from "lucide-svelte";
</script>

<!-- Variants -->
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link Button</Button>

<!-- Sizes -->
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Check class="h-4 w-4" /></Button>

<!-- With Icons -->
<Button>
	<Check class="mr-2 h-4 w-4" />
	Complete Task
</Button>

<!-- As Link -->
<Button href="/dashboard">Go to Dashboard</Button>

<!-- Disabled -->
<Button disabled>Loading...</Button>
```

### Card Components

Cards are composed of multiple sub-components:

```svelte
<script>
	import { 
		Card, 
		CardHeader, 
		CardTitle, 
		CardDescription, 
		CardContent, 
		CardFooter 
	} from "$lib/components/ui";
</script>

<Card>
	<CardHeader>
		<CardTitle>Goal Progress</CardTitle>
		<CardDescription>Track your daily objectives</CardDescription>
	</CardHeader>
	<CardContent>
		<p>Content goes here...</p>
	</CardContent>
	<CardFooter class="flex justify-between">
		<Button variant="outline">Cancel</Button>
		<Button>Save</Button>
	</CardFooter>
</Card>
```

### Input Component

Form inputs with proper validation states:

```svelte
<script>
	import { Input } from "$lib/components/ui";
	
	let email = "";
	let password = "";
</script>

<!-- Basic Input -->
<Input 
	type="email" 
	placeholder="your@email.com" 
	bind:value={email} 
/>

<!-- Password Input -->
<Input 
	type="password" 
	placeholder="Enter password" 
	bind:value={password} 
/>

<!-- Disabled Input -->
<Input disabled placeholder="Disabled input" />

<!-- With Custom Classes -->
<Input class="max-w-sm" placeholder="Custom styling" />
```

## 🎨 Design System Integration

### CSS Variables

The components use CSS variables that integrate with both shadcn design tokens and your existing ChainForge brand colors:

```css
:root {
	/* shadcn-svelte tokens */
	--background: 0 0% 100%;
	--foreground: 222.2 84% 4.9%;
	--primary: 221.2 83.2% 53.3%;
	--secondary: 210 40% 96%;
	/* ... more variables */
}

.dark {
	/* Dark mode variants */
	--background: 222.2 84% 4.9%;
	--foreground: 210 40% 98%;
	/* ... dark mode variables */
}
```

### Brand Colors

Your existing ChainForge brand colors are preserved:

- **Primary Brand**: `primary-500` (#3b82f6) - Main brand blue
- **Secondary Brand**: `secondary-500` (#f97316) - Accent orange
- **Success**: `success-500` (#22c55e)
- **Warning**: `warning-500` (#f59e0b)
- **Error**: `error-500` (#ef4444)

### Using Brand Colors with shadcn Components

```svelte
<!-- Use brand colors with shadcn components -->
<Button class="bg-secondary-500 hover:bg-secondary-600">
	Brand Action
</Button>

<Card class="border-primary-200 bg-primary-50">
	<CardContent>Brand-colored card</CardContent>
</Card>
```

## 🌙 Dark Mode

Dark mode is fully supported and can be toggled programmatically:

```svelte
<script>
	let isDark = false;
	
	function toggleTheme() {
		isDark = !isDark;
		document.documentElement.classList.toggle("dark");
	}
</script>

<Button on:click={toggleTheme}>
	Toggle {isDark ? "Light" : "Dark"} Mode
</Button>
```

## 📱 Mobile-First Design

All components are designed mobile-first and work seamlessly with your existing mobile optimizations:

```svelte
<!-- Responsive card grid -->
<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
	<Card>
		<CardContent>Card 1</CardContent>
	</Card>
	<Card>
		<CardContent>Card 2</CardContent>
	</Card>
	<Card>
		<CardContent>Card 3</CardContent>
	</Card>
</div>

<!-- Touch-friendly buttons -->
<Button size="lg" class="w-full sm:w-auto">
	Mobile-Optimized Button
</Button>
```

## 🛠 Customization

### Custom Variants

You can extend component variants by modifying the component files in `src/lib/components/ui/`:

```typescript
// In button.svelte
const buttonVariants = cva(
	"base-classes...",
	{
		variants: {
			variant: {
				default: "...",
				// Add your custom variant
				brand: "bg-secondary-500 text-white hover:bg-secondary-600"
			}
		}
	}
);
```

### Utility Classes

Use the `cn()` utility to merge classes safely:

```svelte
<script>
	import { cn } from "$lib/utils";
</script>

<Button class={cn("my-custom-class", someCondition && "conditional-class")}>
	Custom Button
</Button>
```

## 🔄 Migration Guide

### Replacing Existing Components

1. **Old Custom Buttons** → **shadcn Button**
   ```svelte
   <!-- Old -->
   <button class="btn btn-primary">Click me</button>
   
   <!-- New -->
   <Button variant="default">Click me</Button>
   ```

2. **Old Card Components** → **shadcn Card**
   ```svelte
   <!-- Old -->
   <div class="card card-mobile">
     <div class="card-header">Title</div>
     <div class="card-content">Content</div>
   </div>
   
   <!-- New -->
   <Card>
     <CardHeader>
       <CardTitle>Title</CardTitle>
     </CardHeader>
     <CardContent>Content</CardContent>
   </Card>
   ```

3. **Old Inputs** → **shadcn Input**
   ```svelte
   <!-- Old -->
   <input class="input" placeholder="Enter text" />
   
   <!-- New -->
   <Input placeholder="Enter text" />
   ```

## 🧪 Testing

Visit `/demo` to see all components in action and test different variants, sizes, and states.

## 📦 Adding More Components

To add more shadcn-svelte components:

1. Install any additional dependencies
2. Create the component in `src/lib/components/ui/`
3. Export it from `src/lib/components/ui/index.ts`
4. Add examples to the demo page

## 🎯 Best Practices

1. **Consistency**: Use shadcn components for new UI elements
2. **Accessibility**: Components come with built-in accessibility features
3. **Responsive**: Always test on mobile devices
4. **Theming**: Use CSS variables for consistent theming
5. **Performance**: Import only the components you need

## 🔗 Resources

- [shadcn-svelte Documentation](https://www.shadcn-svelte.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Lucide Icons](https://lucide.dev/)

---

Happy coding! 🚀