import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { createPlayer, listPlayers } from '$lib/server/services/playerService';

export const GET: RequestHandler = () =>
	withErrorHandling(async () => {
		const players = await listPlayers();
		return json(players);
	});

export const POST: RequestHandler = ({ request }) =>
	withErrorHandling(async () => {
		const body = await request.json();
		const player = await createPlayer(body);
		return json(player, { status: 201 });
	});
