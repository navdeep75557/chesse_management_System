import type { PageServerLoad } from './$types';
import { listTournaments } from '$lib/server/services/tournamentService';

export const load: PageServerLoad = async () => {
	const tournaments = await listTournaments();
	return { tournaments };
};
