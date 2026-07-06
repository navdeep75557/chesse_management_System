<script lang="ts">
	interface Entry {
		rank: number;
		player: { id: number; name: string; rating: number };
		wins: number;
		losses: number;
		gamesPlayed: number;
	}

	let { rankings }: { rankings: Entry[] } = $props();

	// Visual podium order: 2nd, 1st, 3rd, with differing heights per place.
	const order = [2, 1, 3];
	const heights: Record<number, string> = { 1: 'h-28', 2: 'h-20', 3: 'h-14' };
	const medals: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

	function entryFor(rank: number) {
		return rankings.find((r) => r.rank === rank);
	}
</script>

{#if rankings.length === 0}
	<div class="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
		<p class="text-slate-500">No completed matches yet — rankings will appear once results are recorded.</p>
	</div>
{:else}
	<div class="flex items-end justify-center gap-4 sm:gap-6">
		{#each order as rank (rank)}
			{@const entry = entryFor(rank)}
			{#if entry}
				<div class="flex flex-col items-center w-28 sm:w-36">
					<span class="text-3xl">{medals[rank]}</span>
					<p class="font-semibold text-slate-900 text-sm text-center mt-1 truncate w-full">
						{entry.player.name}
					</p>
					<p class="text-xs text-slate-500 mb-2">
						{entry.wins}W &ndash; {entry.losses}L
					</p>
					<div
						class="w-full {heights[rank]} rounded-t-lg bg-gradient-to-b from-slate-700 to-slate-900 flex items-start justify-center pt-2"
					>
						<span class="text-white font-bold text-lg">{rank}</span>
					</div>
				</div>
			{/if}
		{/each}
	</div>
{/if}
