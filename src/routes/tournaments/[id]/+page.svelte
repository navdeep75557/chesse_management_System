<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { api, ApiRequestError } from '$lib/api';
	import { toastSuccess, toastError } from '$lib/stores/toast.svelte';
	import Podium from '$lib/components/Podium.svelte';

	let { data }: PageProps = $props();

	let selectedPlayerId = $state<number | ''>('');
	let enrolling = $state(false);
	let removingId = $state<number | null>(null);
	let generating = $state(false);
	let recordingId = $state<number | null>(null);

	const statusStyles: Record<string, string> = {
		upcoming: 'bg-blue-100 text-blue-700',
		ongoing: 'bg-emerald-100 text-emerald-700',
		completed: 'bg-slate-200 text-slate-600'
	};

	const matchesByRound = $derived.by(() => {
		const rounds = new Map<number, typeof data.matches>();
		for (const match of data.matches) {
			const list = rounds.get(match.round) ?? [];
			list.push(match);
			rounds.set(match.round, list);
		}
		return [...rounds.entries()].sort((a, b) => a[0] - b[0]);
	});

	const latestRoundInProgress = $derived(
		data.matches.some((m) => {
			const maxRound = Math.max(0, ...data.matches.map((mm) => mm.round));
			return m.round === maxRound && m.winnerId === null;
		})
	);

	async function handleEnroll(e: SubmitEvent) {
		e.preventDefault();
		if (!selectedPlayerId) return;
		enrolling = true;
		try {
			await api.post(`/api/tournaments/${data.tournament.id}/players`, {
				playerId: selectedPlayerId
			});
			toastSuccess('Player enrolled');
			selectedPlayerId = '';
			await invalidateAll();
		} catch (err) {
			toastError(err instanceof ApiRequestError ? err.message : 'Failed to enroll player');
		} finally {
			enrolling = false;
		}
	}

	async function handleRemove(playerId: number, name: string) {
		if (!confirm(`Remove ${name} from this tournament?`)) return;
		removingId = playerId;
		try {
			await api.delete(`/api/tournaments/${data.tournament.id}/players`, { playerId });
			toastSuccess(`${name} removed`);
			await invalidateAll();
		} catch (err) {
			toastError(err instanceof ApiRequestError ? err.message : 'Failed to remove player');
		} finally {
			removingId = null;
		}
	}

	async function handleGenerateMatches() {
		generating = true;
		try {
			await api.post(`/api/tournaments/${data.tournament.id}/generate-matches`);
			toastSuccess('Matches generated for the next round');
			await invalidateAll();
		} catch (err) {
			toastError(err instanceof ApiRequestError ? err.message : 'Failed to generate matches');
		} finally {
			generating = false;
		}
	}

	async function handleRecordResult(matchId: number) {
		recordingId = matchId;
		try {
			await api.post(`/api/matches/${matchId}/result`);
			toastSuccess('Result recorded');
			await invalidateAll();
		} catch (err) {
			toastError(err instanceof ApiRequestError ? err.message : 'Failed to record result');
		} finally {
			recordingId = null;
		}
	}
</script>


<div class="mb-8">
	<a href="/tournaments" class="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
		>&larr; Back to tournaments</a
	>
	<div class="flex items-start justify-between gap-3 mt-3">
		<div>
			<h1 class="font-display text-3xl font-bold text-slate-900">{data.tournament.name}</h1>
			<p class="text-sm text-slate-500 mt-1">
				{new Date(data.tournament.startDate).toLocaleDateString()} &ndash; {new Date(
					data.tournament.endDate
				).toLocaleDateString()}
			</p>
		</div>
		<div class="flex items-center gap-3 shrink-0">
			<span class="rounded-full px-3 py-1 text-xs font-semibold {statusStyles[data.tournament.status]}"
				>{data.tournament.status}</span
			>
			<a href="/tournaments/{data.tournament.id}/edit" class="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:text-indigo-700 hover:border-indigo-300 transition-colors"
				>Edit</a
			>
		</div>
	</div>
</div>

<div class="grid lg:grid-cols-2 gap-6 mb-8">
	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-100">
		<h2 class="font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
			<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 text-sm">👥</span>
			Enrolled Players
			<span class="ml-auto text-sm font-normal text-slate-400">{data.enrolled.length}/{data.tournament.maxPlayers}</span>
		</h2>

		{#if data.enrolled.length === 0}
			<p class="text-sm text-slate-500 mb-4">No players enrolled yet.</p>
		{:else}
			<ul class="divide-y divide-slate-100 mb-4">
				{#each data.enrolled as entry (entry.id)}
					<li class="flex items-center justify-between py-2.5 text-sm">
						<span class="text-slate-800 font-medium">{entry.player.name} <span class="text-slate-400 font-normal">({entry.player.rating})</span></span>
						<button
							onclick={() => handleRemove(entry.playerId, entry.player.name)}
							disabled={removingId === entry.playerId}
							class="text-red-500 hover:text-red-700 disabled:opacity-50 cursor-pointer text-xs font-medium"
						>
							{removingId === entry.playerId ? 'Removing…' : 'Remove'}
						</button>
					</li>
				{/each}
			</ul>
		{/if}

		{#if data.enrolled.length < data.tournament.maxPlayers}
			<form onsubmit={handleEnroll} class="flex gap-2">
				<select
					bind:value={selectedPlayerId}
					class="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
				>
					<option value="">Select a player to enroll…</option>
					{#each data.availablePlayers as p (p.id)}
						<option value={p.id}>{p.name} ({p.rating})</option>
					{/each}
				</select>
				<button
					type="submit"
					disabled={!selectedPlayerId || enrolling}
					class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-4 py-2 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 cursor-pointer whitespace-nowrap transition-shadow"
				>
					{enrolling ? 'Enrolling…' : 'Enroll'}
				</button>
			</form>
		{:else}
			<p class="text-xs text-slate-400">Tournament is full.</p>
		{/if}
	</section>

	<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-100">
		<h2 class="font-display font-semibold text-slate-900 mb-4 flex items-center gap-2">
			<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-amber-600 text-sm">🏆</span>
			Rankings
		</h2>
		<Podium rankings={data.rankings} />
	</section>
</div>

<section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md shadow-slate-100 mb-8">
	<div class="flex items-center justify-between mb-4">
		<h2 class="font-display font-semibold text-slate-900 flex items-center gap-2">
			<span class="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 text-sm">♟</span>
			Matches
		</h2>
		<button
			onclick={handleGenerateMatches}
			disabled={generating || data.enrolled.length < 2 || latestRoundInProgress}
			class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-4 py-2 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-50 disabled:hover:shadow-none cursor-pointer transition-shadow"
		>
			{generating ? 'Generating…' : 'Generate Next Round'}
		</button>
	</div>

	{#if data.enrolled.length < 2}
		<p class="text-sm text-slate-500">Enroll at least 2 players to generate matches.</p>
	{:else if latestRoundInProgress}
		<p class="text-sm text-amber-600 mb-3">
			Finish recording all results in the current round before generating the next one.
		</p>
	{/if}

	{#if data.matches.length === 0}
		<div class="rounded-xl border border-dashed border-slate-300 p-10 text-center mt-2">
			<p class="text-slate-400 text-sm">No matches generated yet.</p>
		</div>
	{:else}
		<div class="space-y-6 mt-2">
			{#each matchesByRound as [round, matches] (round)}
				<div>
					<h3 class="text-sm font-semibold text-slate-700 mb-2">Round {round}</h3>
					<div class="overflow-x-auto rounded-xl border border-slate-200">
						<table class="w-full text-sm">
							<thead>
								<tr class="border-b border-slate-200 text-left text-slate-500 bg-slate-50">
									<th class="px-4 py-2.5 font-medium">Player 1</th>
									<th class="px-4 py-2.5 font-medium">Player 2</th>
									<th class="px-4 py-2.5 font-medium">Result</th>
									<th class="px-4 py-2.5 font-medium"></th>
								</tr>
							</thead>
							<tbody>
								{#each matches as match (match.id)}
									<tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
										<td class="px-4 py-2.5 text-slate-800">{match.player1?.name}</td>
										<td class="px-4 py-2.5 text-slate-800">
											{#if match.player2}
												{match.player2.name}
											{:else}
												<span class="italic text-slate-400">— (bye)</span>
											{/if}
										</td>
										<td class="px-4 py-2.5">
											{#if match.winner}
												<span class="rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-0.5">{match.winner.name} won</span>
											{:else}
												<span class="rounded-full bg-slate-100 text-slate-500 text-xs font-medium px-2 py-0.5">Pending</span>
											{/if}
										</td>
										<td class="px-4 py-2.5 text-right">
											{#if !match.winnerId && match.player2}
												<button
													onclick={() => handleRecordResult(match.id)}
													disabled={recordingId === match.id}
													class="rounded-lg bg-slate-800 text-white text-xs font-medium px-3 py-1.5 hover:bg-slate-700 disabled:opacity-50 cursor-pointer transition-colors"
												>
													{recordingId === match.id ? 'Simulating…' : 'Simulate Result'}
												</button>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
