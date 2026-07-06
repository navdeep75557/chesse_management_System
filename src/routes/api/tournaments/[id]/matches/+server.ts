import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import { listTournamentMatches } from '$lib/server/services/matchService';

export const GET: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const tournamentId = parseIdParam(params.id, 'tournament id');
		const matches = await listTournamentMatches(tournamentId);
		return json(matches);
	});
