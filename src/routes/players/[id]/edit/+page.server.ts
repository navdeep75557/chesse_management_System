import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { HttpError } from '$lib/server/errors';
import { getPlayer } from '$lib/server/services/playerService';
import { parseIdParam } from '$lib/server/validation';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const id = parseIdParam(params.id);
		const player = await getPlayer(id);
		return { player };
	} catch (err) {
		if (err instanceof HttpError) error(err.status, err.message);
		throw err;
	}
};
