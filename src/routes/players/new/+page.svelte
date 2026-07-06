<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import PlayerForm from '$lib/components/PlayerForm.svelte';
	import { toastSuccess } from '$lib/stores/toast.svelte';
	import type { PlayerInput } from '$lib/types';

	async function handleSubmit(data: PlayerInput) {
		await api.post('/api/players', data);
		toastSuccess(`Player "${data.name}" created`);
		await goto('/players');
	}
</script>

<a href="/players" class="text-sm text-slate-500 hover:text-indigo-600">&larr; Back to players</a>
<h1 class="font-display text-2xl font-bold text-slate-900 mt-2 mb-6">New Player</h1>
<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md">
	<PlayerForm submitLabel="Create Player" onSubmit={handleSubmit} />
</div>
