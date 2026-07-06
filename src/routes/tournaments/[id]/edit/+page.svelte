<script lang="ts">
	import type { PageProps } from './$types';
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import TournamentForm from '$lib/components/TournamentForm.svelte';
	import { toastSuccess } from '$lib/stores/toast.svelte';
	import type { TournamentInput } from '$lib/types';

	let { data }: PageProps = $props();

	async function handleSubmit(input: TournamentInput) {
		await api.put(`/api/tournaments/${data.tournament.id}`, input);
		toastSuccess(`Tournament "${input.name}" updated`);
		await goto(`/tournaments/${data.tournament.id}`);
	}
</script>

<h1 class="text-2xl font-bold text-slate-900 mb-6">Edit Tournament</h1>
<TournamentForm initial={data.tournament} showStatus submitLabel="Save Changes" onSubmit={handleSubmit} />
