<script lang="ts">
	import { toasts, dismiss } from '$lib/stores/toast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
	{#each toasts as toast (toast.id)}
		<div

				class="rounded-xl shadow-lg backdrop-blur-sm px-4 py-3 text-sm text-white flex items-start justify-between gap-3 animate-fade-in-up border border-white/10"
				class:bg-emerald-600={toast.kind === 'success'}
				class:bg-red-600={toast.kind === 'error'}
				class:bg-slate-800={toast.kind !== 'success' && toast.kind !== 'error'}
			>
				<span class="flex items-center gap-2">
					<span aria-hidden="true">{toast.kind === 'success' ? '✓' : '⚠'}</span>
					{toast.text}
				</span>
			<button
				onclick={() => dismiss(toast.id)}
				class="shrink-0 opacity-80 hover:opacity-100 cursor-pointer text-lg leading-none"
				aria-label="Dismiss"
			>&times;</button>
		</div>
	{/each}
</div>
