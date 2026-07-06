import { prisma } from '$lib/server/db';
import { NotFoundError } from '$lib/server/errors';

/**
 * Computes standings for a tournament and returns the top 3 players.
 *
 * Ranking rule: sort by win count (descending), then by games played
 * (descending) as a tiebreaker — a player who has proven more wins across
 * more games ranks above one with the same win count but fewer games played.
 * Only played matches (winnerId set) count toward games played/wins/losses.
 */
export async function getTournamentRankings(tournamentId: number) {
	const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
	if (!tournament) throw new NotFoundError(`Tournament ${tournamentId} not found`);

	const enrolled = await prisma.tournamentPlayer.findMany({
		where: { tournamentId },
		include: { player: true }
	});

	const playedMatches = await prisma.match.findMany({
		where: { tournamentId, winnerId: { not: null } }
	});

	const stats = new Map<number, { wins: number; gamesPlayed: number }>();
	for (const entry of enrolled) {
		stats.set(entry.playerId, { wins: 0, gamesPlayed: 0 });
	}

	for (const match of playedMatches) {
		for (const playerId of [match.player1Id, match.player2Id]) {
			if (playerId === null) continue;
			const s = stats.get(playerId);
			if (!s) continue; // player no longer enrolled
			s.gamesPlayed += 1;
			if (match.winnerId === playerId) s.wins += 1;
		}
	}

	const standings = enrolled
		.map((entry) => {
			const s = stats.get(entry.playerId)!;
			return {
				player: entry.player,
				wins: s.wins,
				losses: s.gamesPlayed - s.wins,
				gamesPlayed: s.gamesPlayed
			};
		})
		.sort((a, b) => b.wins - a.wins || b.gamesPlayed - a.gamesPlayed);

	return standings.slice(0, 3).map((entry, i) => ({ rank: i + 1, ...entry }));
}
