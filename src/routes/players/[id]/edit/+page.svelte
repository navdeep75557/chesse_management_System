<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import PlayerForm from '$lib/components/PlayerForm.svelte';
	import { toastSuccess } from '$lib/stores/toast.svelte';
	import type { PlayerInput } from '$lib/types';

	let { data }: PageProps = $props();

	async function handleSubmit(input: PlayerInput) {
		await api.put(`/api/players/${data.player.id}`, input);
		toastSuccess(`Player "${input.name}" updated`);
		await goto('/players');
	}
</script>

<a href="/players" class="text-sm text-slate-500 hover:text-indigo-600">&larr; Back to players</a>
<h1 class="font-display text-2xl font-bold text-slate-900 mt-2 mb-6">Edit Player</h1>
<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md">
	<PlayerForm initial={data.player} submitLabel="Save Changes" onSubmit={handleSubmit} />
</div>
