import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { createTournament, listTournaments } from '$lib/server/services/tournamentService';

export const GET: RequestHandler = () =>
	withErrorHandling(async () => {
		const tournaments = await listTournaments();
		return json(tournaments);
	});

export const POST: RequestHandler = ({ request }) =>
	withErrorHandling(async () => {
		const body = await request.json();
		const tournament = await createTournament(body);
		return json(tournament, { status: 201 });
	});
