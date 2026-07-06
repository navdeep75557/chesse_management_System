import type { PageServerLoad } from './$types';
import { listPlayers } from '$lib/server/services/playerService';

export const load: PageServerLoad = async () => {
	const players = await listPlayers();
	return { players };
};
