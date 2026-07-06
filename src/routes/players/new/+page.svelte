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

<h1 class="text-2xl font-bold text-slate-900 mb-6">New Player</h1>
<PlayerForm submitLabel="Create Player" onSubmit={handleSubmit} />
