import { Prisma } from '@prisma/client';
import { prisma } from '$lib/server/db';
import { ConflictError, NotFoundError, ValidationError } from '$lib/server/errors';
import { validateTournamentInput, type TournamentInputRaw } from '$lib/server/validation';

export async function listTournaments() {
	const tournaments = await prisma.tournament.findMany({
		orderBy: { createdAt: 'desc' },
		include: { _count: { select: { players: true } } }
	});

	return tournaments.map(({ _count, ...t }) => ({ ...t, playerCount: _count.players }));
}

export async function getTournament(id: number) {
	const tournament = await prisma.tournament.findUnique({
		where: { id },
		include: { _count: { select: { players: true } } }
	});
	if (!tournament) throw new NotFoundError(`Tournament ${id} not found`);
	const { _count, ...t } = tournament;
	return { ...t, playerCount: _count.players };
}

export async function createTournament(input: TournamentInputRaw) {
	const data = validateTournamentInput(input);
	return prisma.tournament.create({ data });
}

export async function updateTournament(id: number, input: TournamentInputRaw) {
	const data = validateTournamentInput(input);
	await getTournament(id); // 404 if missing
	return prisma.tournament.update({ where: { id }, data });
}

export async function deleteTournament(id: number) {
	await getTournament(id); // 404 if missing
	await prisma.tournament.delete({ where: { id } });
}

/** Enrolled players for a tournament, ordered by enrollment time. */
export async function listEnrolledPlayers(tournamentId: number) {
	await getTournament(tournamentId); // 404 if missing
	return prisma.tournamentPlayer.findMany({
		where: { tournamentId },
		include: { player: true },
		orderBy: { enrolledAt: 'asc' }
	});
}

/** Enrolls a player, enforcing the tournament's max_players cap and rejecting duplicate enrollment. */
export async function enrollPlayer(tournamentId: number, playerId: number) {
	const tournament = await prisma.tournament.findUnique({
		where: { id: tournamentId },
		include: { _count: { select: { players: true } } }
	});
	if (!tournament) throw new NotFoundError(`Tournament ${tournamentId} not found`);

	const player = await prisma.player.findUnique({ where: { id: playerId } });
	if (!player) throw new NotFoundError(`Player ${playerId} not found`);

	if (tournament._count.players >= tournament.maxPlayers) {
		throw new ConflictError(
			`Tournament is full (max ${tournament.maxPlayers} players)`
		);
	}

	try {
		return await prisma.tournamentPlayer.create({
			data: { tournamentId, playerId },
			include: { player: true }
		});
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
			throw new ConflictError('Player is already enrolled in this tournament');
		}
		throw err;
	}
}

export async function removePlayer(tournamentId: number, playerId: number) {
	const entry = await prisma.tournamentPlayer.findUnique({
		where: { tournamentId_playerId: { tournamentId, playerId } }
	});
	if (!entry) throw new NotFoundError('Player is not enrolled in this tournament');

	const hasPlayedMatches = await prisma.match.findFirst({
		where: {
			tournamentId,
			OR: [{ player1Id: playerId }, { player2Id: playerId }]
		}
	});
	if (hasPlayedMatches) {
		throw new ValidationError('Cannot remove a player who already has matches in this tournament');
	}

	await prisma.tournamentPlayer.delete({
		where: { tournamentId_playerId: { tournamentId, playerId } }
	});
}
