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

	function initials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

	function ratingTier(rating: number) {
		if (rating >= 2000) return 'bg-amber-100 text-amber-700';
		if (rating >= 1600) return 'bg-indigo-100 text-indigo-700';
		if (rating >= 1200) return 'bg-emerald-100 text-emerald-700';
		return 'bg-slate-100 text-slate-600';
	}
</script>

<div class="flex items-center justify-between mb-6">
	<div>
		<h1 class="font-display text-2xl font-bold text-slate-900">Players</h1>
		<p class="text-sm text-slate-500 mt-0.5">
			{data.players.length} registered {data.players.length === 1 ? 'player' : 'players'}
		</p>
	</div>
	<a
		href="/players/new"
		class="rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-5 py-2.5 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 transition-all"
	>
		+ New Player
	</a>
</div>

{#if data.players.length === 0}
	<div class="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-12 text-center">
		<div class="w-14 h-14 rounded-full bg-indigo-50 grid place-items-center text-2xl mx-auto mb-3">
			&#9823;
		</div>
		<p class="text-slate-500">No players yet.</p>
		<a href="/players/new" class="text-indigo-600 font-medium hover:underline mt-2 inline-block"
			>Add your first player</a
		>
	</div>
{:else}

	<div class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-slate-200 text-left text-slate-500 bg-slate-50/80">
					<th class="px-4 py-3 font-medium">Name</th>
					<th class="px-4 py-3 font-medium">Email</th>
					<th class="px-4 py-3 font-medium">Rating</th>
					<th class="px-4 py-3 font-medium">Joined</th>
					<th class="px-4 py-3 font-medium text-right">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.players as player (player.id)}
					<tr class="border-b border-slate-100 last:border-0 hover:bg-indigo-50/40 transition-colors">
						<td class="px-4 py-3 font-medium text-slate-900">
							<a href="/players/{player.id}/matches" class="flex items-center gap-3 hover:text-indigo-600">
								<span
									class="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold grid place-items-center shrink-0"
								>
									{initials(player.name)}
								</span>
								{player.name}
							</a>
						</td>
						<td class="px-4 py-3 text-slate-600">{player.email}</td>
						<td class="px-4 py-3">
							<span class={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${ratingTier(player.rating)}`}
								>{player.rating}</span
							>
						</td>
						<td class="px-4 py-3 text-slate-500">{new Date(player.createdAt).toLocaleDateString()}</td>
						<td class="px-4 py-3 text-right space-x-3 whitespace-nowrap">
							<a href="/players/{player.id}/edit" class="text-slate-500 hover:text-indigo-600">Edit</a>
							<button
								onclick={() => handleDelete(player.id, player.name)}
								disabled={deletingId === player.id}
								class="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer"
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
