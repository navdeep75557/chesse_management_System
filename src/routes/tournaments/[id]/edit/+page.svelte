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

<a href="/tournaments/{data.tournament.id}" class="text-sm text-slate-500 hover:text-indigo-600"
	>&larr; Back to tournament</a
>
<h1 class="font-display text-2xl font-bold text-slate-900 mt-2 mb-6">Edit Tournament</h1>
<div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm max-w-md">
	<TournamentForm initial={data.tournament} showStatus submitLabel="Save Changes" onSubmit={handleSubmit} />
</div>
