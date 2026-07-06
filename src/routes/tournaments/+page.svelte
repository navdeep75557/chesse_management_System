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
	<div>
		<h1 class="font-display text-2xl font-bold text-slate-900">Tournaments</h1>
		<p class="text-sm text-slate-500 mt-0.5">{data.tournaments.length} total</p>
	</div>
	<a
		href="/tournaments/new"
		class="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-5 py-2.5 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
	>
		+ New Tournament
	</a>
</div>

{#if data.tournaments.length === 0}
	<div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
		<div class="w-14 h-14 rounded-full bg-purple-50 grid place-items-center text-2xl mx-auto mb-3">
			&#127942;
		</div>
		<p class="text-slate-500">No tournaments yet.</p>
		<a href="/tournaments/new" class="text-indigo-600 font-medium hover:underline mt-2 inline-block"
			>Create your first tournament</a
		>
	</div>
{:else}
	<div class="grid gap-4 sm:grid-cols-2">
		{#each data.tournaments as t (t.id)}
			<div
				class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-300"
			>
				<div class="flex items-start justify-between gap-2">
					<a href="/tournaments/{t.id}" class="font-semibold text-slate-900 group-hover:text-indigo-600"
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
				<div class="mt-3">
					<div class="flex items-center justify-between text-xs text-slate-500 mb-1">
						<span>Players</span>
						<span>{t.playerCount} / {t.maxPlayers}</span>
					</div>
					<div class="h-1.5 rounded-full bg-slate-100 overflow-hidden">
						<div
							class="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
							style="width: {Math.min(100, (t.playerCount / t.maxPlayers) * 100)}%"
						></div>
					</div>
				</div>
				<div class="mt-4 flex gap-3 text-sm">
					<a href="/tournaments/{t.id}" class="text-slate-500 hover:text-indigo-600">View</a>
					<a href="/tournaments/{t.id}/edit" class="text-slate-500 hover:text-indigo-600">Edit</a>
					<button
						onclick={() => handleDelete(t.id, t.name)}
						disabled={deletingId === t.id}
						class="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer ml-auto"
					>
						{deletingId === t.id ? 'Deleting…' : 'Delete'}
					</button>
				</div>
			</div>
		{/each}
	</div>
{/if}
