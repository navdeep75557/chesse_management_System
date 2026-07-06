import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import { recordMatchResult } from '$lib/server/services/matchService';

export const POST: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const matchId = parseIdParam(params.id, 'match id');
		const match = await recordMatchResult(matchId);
		return json(match);
	});
