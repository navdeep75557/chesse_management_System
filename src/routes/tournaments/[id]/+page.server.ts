import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { HttpError } from '$lib/server/errors';
import { getTournament, listEnrolledPlayers } from '$lib/server/services/tournamentService';
import { listTournamentMatches } from '$lib/server/services/matchService';
import { getTournamentRankings } from '$lib/server/services/rankingService';
import { listPlayers } from '$lib/server/services/playerService';
import { parseIdParam } from '$lib/server/validation';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const id = parseIdParam(params.id);
		const [tournament, enrolled, matches, rankings, allPlayers] = await Promise.all([
			getTournament(id),
			listEnrolledPlayers(id),
			listTournamentMatches(id),
			getTournamentRankings(id),
			listPlayers()
		]);

		const enrolledIds = new Set(enrolled.map((e) => e.playerId));
		const availablePlayers = allPlayers.filter((p) => !enrolledIds.has(p.id));

		return { tournament, enrolled, matches, rankings, availablePlayers };
	} catch (err) {
		if (err instanceof HttpError) error(err.status, err.message);
		throw err;
	}
};
