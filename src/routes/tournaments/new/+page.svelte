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

<a href="/tournaments" class="text-sm text-slate-500 hover:text-indigo-600">&larr; Back to tournaments</a>
<h1 class="font-display text-2xl font-bold text-slate-900 mt-2 mb-6">New Tournament</h1>
<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md">
	<TournamentForm submitLabel="Create Tournament" onSubmit={handleSubmit} />
</div>
