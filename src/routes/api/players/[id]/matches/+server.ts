import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import { getPlayerMatchHistory } from '$lib/server/services/playerService';

export const GET: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		const matches = await getPlayerMatchHistory(id);
		return json(matches);
	});
