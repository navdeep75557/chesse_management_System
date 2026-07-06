import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import { generateMatches } from '$lib/server/services/matchService';

export const POST: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const tournamentId = parseIdParam(params.id, 'tournament id');
		const matches = await generateMatches(tournamentId);
		return json(matches, { status: 201 });
	});
