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

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex flex-col">
	<header
		class="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-950 text-white shadow-lg shadow-indigo-950/20 sticky top-0 z-40 border-b border-white/10"
	>
		<nav class="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-6">
			<a href="/" class="font-display font-bold text-lg tracking-tight flex items-center gap-2 group">
				<span
					class="grid place-items-center w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-md shadow-indigo-900/40 text-lg group-hover:scale-105 transition-transform"
					aria-hidden="true"
					>♞</span
				>
				<span>Chess<span class="text-indigo-400">Tournaments</span></span>
			</a>
			<div class="flex gap-1 ml-auto">
				{#each links as link (link.href)}
					<a
						href={link.href}
						class={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
							isActive(link.href)
								? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-900/30'
								: 'text-slate-300 hover:text-white hover:bg-white/10'
						}`}
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

	<footer class="text-center text-xs text-slate-400 py-6 border-t border-slate-200/60">
		Chess Tournament Management System
	</footer>
</div>

<ToastContainer />
