<script lang="ts">
	import { goto } from '$app/navigation';
	import { api } from '$lib/api';
	import TournamentForm from '$lib/components/TournamentForm.svelte';
	import { toastSuccess } from '$lib/stores/toast.svelte';
	import type { Tournament, TournamentInput } from '$lib/types';

	async function handleSubmit(data: TournamentInput) {
		const tournament = await api.post<Tournament>('/api/tournaments', data);
		toastSuccess(`Tournament "${data.name}" created`);
		await goto(`/tournaments/${tournament.id}`);
	}
</script>

<h1 class="text-2xl font-bold text-slate-900 mb-6">New Tournament</h1>
<TournamentForm submitLabel="Create Tournament" onSubmit={handleSubmit} />
