<script lang="ts">
	import type { PlayerInput } from '$lib/types';
	import { ApiRequestError } from '$lib/api';

	let {
		initial = { name: '', email: '', rating: 1200 },
		submitLabel = 'Save',
		onSubmit
	}: {
		initial?: Partial<PlayerInput>;
		submitLabel?: string;
		onSubmit: (data: PlayerInput) => Promise<void>;
	} = $props();

	let name = $state(initial.name ?? '');
	let email = $state(initial.email ?? '');
	let rating = $state(initial.rating ?? 1200);
	let errors = $state<Record<string, string>>({});
	let submitting = $state(false);

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		submitting = true;
		try {
			await onSubmit({ name, email, rating: Number(rating) });
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

<form onsubmit={handleSubmit} class="space-y-4 max-w-md">
	{#if errors.form}
		<p class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
			{errors.form}
		</p>
	{/if}

	<div>
		<label for="name" class="block text-sm font-medium text-slate-700 mb-1">Name</label>
		<input
			id="name"
			type="text"
			bind:value={name}
			class="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
			class:border-red-400={errors.name}
			class:border-slate-300={!errors.name}
		/>
		{#if errors.name}<p class="text-xs text-red-600 mt-1">{errors.name}</p>{/if}
	</div>

	<div>
		<label for="email" class="block text-sm font-medium text-slate-700 mb-1">Email</label>
		<input
			id="email"
			type="email"
			bind:value={email}
			class="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
			class:border-red-400={errors.email}
			class:border-slate-300={!errors.email}
		/>
		{#if errors.email}<p class="text-xs text-red-600 mt-1">{errors.email}</p>{/if}
	</div>

	<div>
		<label for="rating" class="block text-sm font-medium text-slate-700 mb-1">Rating</label>
		<input
			id="rating"
			type="number"
			min="1"
			step="1"
			bind:value={rating}
			class="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
			class:border-red-400={errors.rating}
			class:border-slate-300={!errors.rating}
		/>
		{#if errors.rating}<p class="text-xs text-red-600 mt-1">{errors.rating}</p>{/if}
	</div>

	<button
		type="submit"
		disabled={submitting}
		class="rounded-md bg-slate-900 text-white text-sm font-medium px-4 py-2 hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
	>
		{submitting ? 'Saving...' : submitLabel}
	</button>
</form>
