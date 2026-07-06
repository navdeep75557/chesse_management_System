<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { api, ApiRequestError } from '$lib/api';
	import { toastSuccess, toastError } from '$lib/stores/toast.svelte';

	let { data }: PageProps = $props();
	let deletingId = $state<number | null>(null);

	const statusStyles: Record<string, string> = {
		upcoming: 'bg-blue-100 text-blue-700',
		ongoing: 'bg-emerald-100 text-emerald-700',
		completed: 'bg-slate-200 text-slate-600'
	};

	async function handleDelete(id: number, name: string) {
		if (!confirm(`Delete tournament "${name}"? This cannot be undone.`)) return;
		deletingId = id;
		try {
			await api.delete(`/api/tournaments/${id}`);
			toastSuccess(`Deleted ${name}`);
			await invalidateAll();
		} catch (err) {
			toastError(err instanceof ApiRequestError ? err.message : 'Failed to delete tournament');
		} finally {
			deletingId = null;
		}
	}
</script>

<div class="flex items-center justify-between mb-6">
	<h1 class="text-2xl font-bold text-slate-900">Tournaments</h1>
	<a
		href="/tournaments/new"
		class="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800"
	>
		+ New Tournament
	</a>
</div>

{#if data.tournaments.length === 0}
	<div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
		<p class="text-slate-500">No tournaments yet.</p>
		<a href="/tournaments/new" class="text-slate-900 font-medium underline mt-2 inline-block"
			>Create your first tournament</a
		>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2">
		{#each data.tournaments as t (t.id)}
			<div class="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex items-start justify-between gap-2">
					<a href="/tournaments/{t.id}" class="font-semibold text-slate-900 hover:underline"
						>{t.name}</a
					>
					<span class="rounded-full px-2 py-0.5 text-xs font-medium shrink-0 {statusStyles[t.status]}"
						>{t.status}</span
					>
				</div>
				<p class="text-sm text-slate-500 mt-1">
					{new Date(t.startDate).toLocaleDateString()} &ndash; {new Date(
						t.endDate
					).toLocaleDateString()}
				</p>
				<p class="text-sm text-slate-500">{t.playerCount} / {t.maxPlayers} players enrolled</p>
				<div class="mt-3 flex gap-3 text-sm">
					<a href="/tournaments/{t.id}" class="text-slate-600 hover:text-slate-900">View</a>
					<a href="/tournaments/{t.id}/edit" class="text-slate-600 hover:text-slate-900">Edit</a>
					<button
						onclick={() => handleDelete(t.id, t.name)}
						disabled={deletingId === t.id}
						class="text-red-600 hover:text-red-800 disabled:opacity-50 cursor-pointer ml-auto"
					>
						{deletingId === t.id ? 'Deleting…' : 'Delete'}
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
