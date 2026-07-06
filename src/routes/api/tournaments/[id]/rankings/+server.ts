import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import { getTournamentRankings } from '$lib/server/services/rankingService';

export const GET: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const tournamentId = parseIdParam(params.id, 'tournament id');
		const rankings = await getTournamentRankings(tournamentId);
		return json(rankings);
	});
