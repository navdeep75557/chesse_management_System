import { json, type RequestHandler } from '@sveltejs/kit';
import { withErrorHandling } from '$lib/server/errors';
import { parseIdParam } from '$lib/server/validation';
import { deletePlayer, getPlayer, updatePlayer } from '$lib/server/services/playerService';

export const GET: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		const player = await getPlayer(id);
		return json(player);
	});

export const PUT: RequestHandler = ({ params, request }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		const body = await request.json();
		const player = await updatePlayer(id, body);
		return json(player);
	});

export const DELETE: RequestHandler = ({ params }) =>
	withErrorHandling(async () => {
		const id = parseIdParam(params.id);
		await deletePlayer(id);
		return new Response(null, { status: 204 });
	});
