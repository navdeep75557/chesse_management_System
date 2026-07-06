import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling, ValidationError } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import {
	enrollPlayer,
	listEnrolledPlayers,
	removePlayer
} from '$lib/server/services/tournamentService';

function extractPlayerId(body: unknown): number {
	const playerId = Number((body as { playerId?: unknown })?.playerId);
	if (!Number.isInteger(playerId) || playerId <= 0) {
		throw new ValidationError('playerId is required and must be a positive integer');
	}
	return playerId;
}

export const GET: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const tournamentId = parseIdParam(params.id, 'tournament id');
		const enrolled = await listEnrolledPlayers(tournamentId);
		return json(enrolled);
	});

export const POST: RequestHandler = ({ params, request }) =>
	withErrorHandling(async () => {
		const tournamentId = parseIdParam(params.id, 'tournament id');
		const body = await request.json();
		const playerId = extractPlayerId(body);
		const entry = await enrollPlayer(tournamentId, playerId);
		return json(entry, { status: 201 });
	});

export const DELETE: RequestHandler = ({ params, request }) =>
	withErrorHandling(async () => {
		const tournamentId = parseIdParam(params.id, 'tournament id');
		const body = await request.json();
		const playerId = extractPlayerId(body);
		await removePlayer(tournamentId, playerId);
		return new Response(null, { status: 204 });
	});
