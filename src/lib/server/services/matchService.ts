import { prisma } from '$lib/server/db';
import { ConflictError, NotFoundError, ValidationError } from '$lib/server/errors';

const matchInclude = { player1: true, player2: true, winner: true } as const;

/**
 * Randomly pairs all enrolled players into a new round of matches.
 *
 * - Players are shuffled (Fisher-Yates) so pairings are unbiased.
 * - An odd player count produces one "bye": a match with no player2, whose
 *   winner is automatically the lone player (recorded as played immediately).
 * - The next round number is (highest existing round) + 1. To keep rounds
 *   sequential and prevent duplicate/overlapping brackets, generation is
 *   rejected while the current round still has unplayed matches.
 */
export async function generateMatches(tournamentId: number) {
	const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
	if (!tournament) throw new NotFoundError(`Tournament ${tournamentId} not found`);

	const enrolled = await prisma.tournamentPlayer.findMany({ where: { tournamentId } });
	if (enrolled.length < 2) {
		throw new ValidationError('At least 2 enrolled players are required to generate matches');
	}

	const latestMatch = await prisma.match.findFirst({
		where: { tournamentId },
		orderBy: { round: 'desc' }
	});
	const latestRound = latestMatch?.round ?? 0;

	if (latestRound > 0) {
		const unplayed = await prisma.match.findFirst({
			where: { tournamentId, round: latestRound, winnerId: null }
		});
		if (unplayed) {
			throw new ConflictError(
				`Round ${latestRound} has unplayed matches; record all results before generating the next round`
			);
		}
	}

	const nextRound = latestRound + 1;

	const shuffled = [...enrolled];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}

	const pairs: { player1Id: number; player2Id: number | null }[] = [];
	for (let i = 0; i < shuffled.length; i += 2) {
		const player2Id = shuffled[i + 1] ? shuffled[i + 1].playerId : null;
		pairs.push({ player1Id: shuffled[i].playerId, player2Id });
	}

	return prisma.$transaction(async (tx) => {
		const created = await Promise.all(
			pairs.map((pair) =>
				tx.match.create({
					data: {
						tournamentId,
						player1Id: pair.player1Id,
						player2Id: pair.player2Id,
						round: nextRound,
						// A bye has no opponent, so it's an automatic, immediately-played win.
						winnerId: pair.player2Id === null ? pair.player1Id : null,
						playedAt: pair.player2Id === null ? new Date() : null
					},
					include: matchInclude
				})
			)
		);

		if (tournament.status === 'upcoming') {
			await tx.tournament.update({ where: { id: tournamentId }, data: { status: 'ongoing' } });
		}

		return created;
	});
}

/** Randomly simulates a match outcome and records it. Rejects if a result already exists. */
export async function recordMatchResult(matchId: number) {
	const match = await prisma.match.findUnique({ where: { id: matchId } });
	if (!match) throw new NotFoundError(`Match ${matchId} not found`);
	if (match.winnerId !== null) throw new ConflictError('This match already has a recorded result');
	if (match.player2Id === null) throw new ValidationError('Bye matches cannot have a result recorded');

	const winnerId = Math.random() < 0.5 ? match.player1Id : match.player2Id;

	return prisma.match.update({
		where: { id: matchId },
		data: { winnerId, playedAt: new Date() },
		include: matchInclude
	});
}

/** Full match log for a tournament (all rounds), with player details for display. */
export async function listTournamentMatches(tournamentId: number) {
	const tournament = await prisma.tournament.findUnique({ where: { id: tournamentId } });
	if (!tournament) throw new NotFoundError(`Tournament ${tournamentId} not found`);

	return prisma.match.findMany({
		where: { tournamentId },
		include: matchInclude,
		orderBy: [{ round: 'asc' }, { id: 'asc' }]
	});
}
