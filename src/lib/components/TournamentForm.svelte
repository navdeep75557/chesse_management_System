<script lang="ts">
	import type { TournamentInput, TournamentStatus } from '$lib/types';
	import { ApiRequestError } from '$lib/api';

	let {
		initial = { name: '', startDate: '', endDate: '', status: 'upcoming', maxPlayers: 8 },
		submitLabel = 'Save',
		showStatus = false,
		onSubmit
	}: {
		initial?: Partial<Omit<TournamentInput, 'startDate' | 'endDate'>> & {
			startDate?: string | Date;
			endDate?: string | Date;
		};
		submitLabel?: string;
		showStatus?: boolean;
		onSubmit: (data: TournamentInput) => Promise<void>;
	} = $props();

	function toDateInputValue(value: string | Date | undefined) {
		if (!value) return '';
		const iso = value instanceof Date ? value.toISOString() : value;
		return iso.slice(0, 10);
	}

	let name = $state(initial.name ?? '');
	let startDate = $state(toDateInputValue(initial.startDate));
	let endDate = $state(toDateInputValue(initial.endDate));
	let status = $state<TournamentStatus>(initial.status ?? 'upcoming');
	let maxPlayers = $state(initial.maxPlayers ?? 8);
	let errors = $state<Record<string, string>>({});
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		submitting = true;
		try {
			await onSubmit({
				name,
				startDate,
				endDate,
				status: showStatus ? status : undefined,
				maxPlayers: Number(maxPlayers)
			});
		} catch (err) {
			if (err instanceof ApiRequestError) {
				errors = err.details ?? { form: err.message };
			} else {
				errors = { form: 'Something went wrong. Please try again.' };
			}
		} finally {
			submitting = false;
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-5 max-w-md">
	{#if errors.form}
		<p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
			{errors.form}
		</p>
	{/if}

	<div>
		<label for="name" class="block text-sm font-medium text-slate-700 mb-1">Name</label>
		<input
			id="name"
			type="text"
			bind:value={name}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
			class:border-red-400={errors.name}
			class:border-slate-200={!errors.name}
		/>
		{#if errors.name}<p class="text-xs text-red-600 mt-1">{errors.name}</p>{/if}
	</div>

	<div class="grid grid-cols-2 gap-4">
		<div>
			<label for="startDate" class="block text-sm font-medium text-slate-700 mb-1">Start date</label>
			<input
				id="startDate"
				type="date"
				bind:value={startDate}
				class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
				class:border-red-400={errors.startDate}
				class:border-slate-200={!errors.startDate}
			/>
			{#if errors.startDate}<p class="text-xs text-red-600 mt-1">{errors.startDate}</p>{/if}
		</div>
		<div>
			<label for="endDate" class="block text-sm font-medium text-slate-700 mb-1">End date</label>
			<input
				id="endDate"
				type="date"
				bind:value={endDate}
				class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
				class:border-red-400={errors.endDate}
				class:border-slate-200={!errors.endDate}
			/>
			{#if errors.endDate}<p class="text-xs text-red-600 mt-1">{errors.endDate}</p>{/if}
		</div>
	</div>

	<div>
		<label for="maxPlayers" class="block text-sm font-medium text-slate-700 mb-1">Max players</label>
		<input
			id="maxPlayers"
			type="number"
			min="2"
			step="1"
			bind:value={maxPlayers}
			class="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
			class:border-red-400={errors.maxPlayers}
			class:border-slate-200={!errors.maxPlayers}
		/>
		{#if errors.maxPlayers}<p class="text-xs text-red-600 mt-1">{errors.maxPlayers}</p>{/if}
	</div>

	{#if showStatus}
		<div>
			<label for="status" class="block text-sm font-medium text-slate-700 mb-1">Status</label>
			<select
				id="status"
				bind:value={status}
				class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition-shadow"
			>
				<option value="upcoming">Upcoming</option>
				<option value="ongoing">Ongoing</option>
				<option value="completed">Completed</option>
			</select>
			{#if errors.status}<p class="text-xs text-red-600 mt-1">{errors.status}</p>{/if}
		</div>
	{/if}

	<button
		type="submit"
		disabled={submitting}
		class="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium px-5 py-2.5 shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:translate-y-0 cursor-pointer transition-all"
	>
		{submitting ? 'Saving...' : submitLabel}
	</button>
</form>
