<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function resultLabel(match: (typeof data.matches)[number]) {
		if (!match.winnerId) return 'Pending';
		return match.winnerId === data.player.id ? 'Won' : 'Lost';
	}
</script>

<div class="mb-6">
	<a href="/players" class="text-sm text-slate-500 hover:text-slate-800">&larr; Back to players</a>
	<h1 class="text-2xl font-bold text-slate-900 mt-1">{data.player.name}'s Match History</h1>
	<p class="text-sm text-slate-500">Rating {data.player.rating} &middot; {data.player.email}</p>
</div>

{#if data.matches.length === 0}
	<div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
		<p class="text-slate-500">No matches played yet.</p>
	</div>
{:else}
	<div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b border-slate-200 text-left text-slate-500">
					<th class="px-4 py-3 font-medium">Tournament</th>
					<th class="px-4 py-3 font-medium">Round</th>
					<th class="px-4 py-3 font-medium">Opponent</th>
					<th class="px-4 py-3 font-medium">Result</th>
					<th class="px-4 py-3 font-medium">Played</th>
				</tr>
			</thead>
			<tbody>
				{#each data.matches as match (match.id)}
					<tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50">
						<td class="px-4 py-3 text-slate-900">
							<a href="/tournaments/{match.tournament.id}" class="hover:underline"
								>{match.tournament.name}</a
							>
						</td>
						<td class="px-4 py-3 text-slate-600">{match.round}</td>
						<td class="px-4 py-3 text-slate-600">
							{#if !match.player2}
								<span class="italic text-slate-400">Bye</span>
							{:else}
								{match.player1Id === data.player.id ? match.player2.name : match.player1?.name}
							{/if}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
								class:bg-emerald-100={resultLabel(match) === 'Won'}
								class:text-emerald-700={resultLabel(match) === 'Won'}
								class:bg-red-100={resultLabel(match) === 'Lost'}
								class:text-red-700={resultLabel(match) === 'Lost'}
								class:bg-slate-100={resultLabel(match) === 'Pending'}
								class:text-slate-500={resultLabel(match) === 'Pending'}
							>
								{resultLabel(match)}
							</span>
						</td>
						<td class="px-4 py-3 text-slate-500">
							{match.playedAt ? new Date(match.playedAt).toLocaleString() : '—'}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}
