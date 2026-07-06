<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { api, ApiRequestError } from '$lib/api';
	import { toastSuccess, toastError } from '$lib/stores/toast.svelte';

	let { data }: PageProps = $props();
	let deletingId = $state<number | null>(null);

	async function handleDelete(id: number, name: string) {
		if (!confirm(`Delete player "${name}"? This cannot be undone.`)) return;
		deletingId = id;
		try {
			await api.delete(`/api/players/${id}`);
			toastSuccess(`Deleted ${name}`);
			await invalidateAll();
		} catch (err) {
			toastError(err instanceof ApiRequestError ? err.message : 'Failed to delete player');
		} finally {
			deletingId = null;
		}
	}
</script>

<div class="flex items-center justify-between mb-6">
	<h1 class="text-2xl font-bold text-slate-900">Players</h1>
	<a
		href="/players/new"
		class="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800"
	>
		+ New Player
	</a>
</div>

{#if data.players.length === 0}
	<div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
		<p class="text-slate-500">No players yet.</p>
		<a href="/players/new" class="text-slate-900 font-medium underline mt-2 inline-block"
			>Add your first player</a
		>
	</div>
{:else}
	<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-slate-200 text-left text-slate-500">
					<th class="px-4 py-3 font-medium">Name</th>
					<th class="px-4 py-3 font-medium">Email</th>
					<th class="px-4 py-3 font-medium">Rating</th>
					<th class="px-4 py-3 font-medium">Joined</th>
					<th class="px-4 py-3 font-medium text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.players as player (player.id)}
					<tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50">
						<td class="px-4 py-3 font-medium text-slate-900">
							<a href="/players/{player.id}/matches" class="hover:underline">{player.name}</a>
						</td>
						<td class="px-4 py-3 text-slate-600">{player.email}</td>
						<td class="px-4 py-3 text-slate-600">{player.rating}</td>
						<td class="px-4 py-3 text-slate-500"
							>{new Date(player.createdAt).toLocaleDateString()}</td
						>
						<td class="px-4 py-3 text-right space-x-3 whitespace-nowrap">
							<a href="/players/{player.id}/edit" class="text-slate-600 hover:text-slate-900"
								>Edit</a
							>
							<button
								onclick={() => handleDelete(player.id, player.name)}
								disabled={deletingId === player.id}
								class="text-red-600 hover:text-red-800 disabled:opacity-50 cursor-pointer"
							>
								{deletingId === player.id ? 'Deleting…' : 'Delete'}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
