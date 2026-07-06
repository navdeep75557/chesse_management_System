import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { HttpError } from '$lib/server/errors';
import { getPlayer, getPlayerMatchHistory } from '$lib/server/services/playerService';
import { parseIdParam } from '$lib/server/validation';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const id = parseIdParam(params.id);
		const [player, matches] = await Promise.all([getPlayer(id), getPlayerMatchHistory(id)]);
		return { player, matches };
	} catch (err) {
		if (err instanceof HttpError) error(err.status, err.message);
		throw err;
	}
};
