<script lang="ts">
	import { toasts, dismiss } from '$lib/stores/toast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
	{#each toasts as toast (toast.id)}
		<div
			class="rounded-lg shadow-lg px-4 py-3 text-sm text-white flex items-start justify-between gap-3 animate-in fade-in slide-in-from-top-2"
			class:bg-emerald-600={toast.kind === 'success'}
			class:bg-red-600={toast.kind === 'error'}
		>
			<span>{toast.text}</span>
			<button
				onclick={() => dismiss(toast.id)}
				class="shrink-0 opacity-80 hover:opacity-100 cursor-pointer"
				aria-label="Dismiss"
			>
				&times;
			</button>
		</div>
	{/each}
</div>
