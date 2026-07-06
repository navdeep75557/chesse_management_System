import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import {
	deleteTournament,
	getTournament,
	updateTournament
} from '$lib/server/services/tournamentService';

export const GET: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		const tournament = await getTournament(id);
		return json(tournament);
	});

export const PUT: RequestHandler = ({ params, request }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		const body = await request.json();
		const tournament = await updateTournament(id, body);
		return json(tournament);
	});

export const DELETE: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		await deleteTournament(id);
		return new Response(null, { status: 204 });
	});
