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

<h1 class="text-2xl font-bold text-slate-900 mb-6">Edit Player</h1>
<PlayerForm initial={data.player} submitLabel="Save Changes" onSubmit={handleSubmit} />
