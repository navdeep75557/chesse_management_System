<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToastContainer from '$lib/components/ToastContainer.svelte';
	import { page } from '$app/state';

	let { children } = $props();

	const links = [
		{ href: '/', label: 'Home' },
		{ href: '/players', label: 'Players' },
		{ href: '/tournaments', label: 'Tournaments' }
	];

	function isActive(href: string) {
		return href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
	}
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="min-h-screen bg-slate-50 flex flex-col">
	<header class="bg-slate-900 text-white shadow-sm sticky top-0 z-40">
		<nav class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
			<a href="/" class="font-semibold text-lg tracking-tight flex items-center gap-2">
				<span aria-hidden="true">♞</span> Chess Tournaments
			</a>
			<div class="flex gap-1 ml-auto">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
						class:bg-slate-700={isActive(link.href)}
						class:text-white={isActive(link.href)}
						class:text-slate-300={!isActive(link.href)}
					>
						{link.label}
					</a>
				{/each}
			</div>
		</nav>
	</header>

	<main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
		{@render children()}
	</main>

	<footer class="text-center text-xs text-slate-400 py-6">
		Chess Tournament Management System
	</footer>
</div>

<ToastContainer />
