import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { HttpError } from '$lib/server/errors';
import { getTournament } from '$lib/server/services/tournamentService';
import { parseIdParam } from '$lib/server/validation';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const id = parseIdParam(params.id);
		const tournament = await getTournament(id);
		return { tournament };
	} catch (err) {
		if (err instanceof HttpError) error(err.status, err.message);
		throw err;
	}
};
