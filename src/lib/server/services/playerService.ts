import { Prisma } from '@prisma/client';
import { prisma } from '$lib/server/db';
import { ConflictError, NotFoundError } from '$lib/server/errors';
import { validatePlayerInput, type PlayerInputRaw } from '$lib/server/validation';

export async function listPlayers() {
	return prisma.player.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getPlayer(id: number) {
	const player = await prisma.player.findUnique({ where: { id } });
	if (!player) throw new NotFoundError(`Player ${id} not found`);
	return player;
}

export async function createPlayer(input: PlayerInputRaw) {
	const data = validatePlayerInput(input);
	try {
		return await prisma.player.create({ data });
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
			throw new ConflictError('A player with this email already exists', { email: 'Email already in use' });
		}
		throw err;
	}
}

export async function updatePlayer(id: number, input: PlayerInputRaw) {
	const data = validatePlayerInput(input);
	await getPlayer(id); // 404 if missing
	try {
		return await prisma.player.update({ where: { id }, data });
	} catch (err) {
		if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
			throw new ConflictError('A player with this email already exists', { email: 'Email already in use' });
		}
		throw err;
	}
}

export async function deletePlayer(id: number) {
	await getPlayer(id); // 404 if missing
	await prisma.player.delete({ where: { id } });
}

/** Full match history for a player across all tournaments, most recent first. */
export async function getPlayerMatchHistory(id: number) {
	await getPlayer(id); // 404 if missing

	return prisma.match.findMany({
		where: {
			OR: [{ player1Id: id }, { player2Id: id }]
		},
		include: {
			player1: true,
			player2: true,
			winner: true,
			tournament: { select: { id: true, name: true } }
		},
		orderBy: [{ tournamentId: 'asc' }, { round: 'asc' }]
	});
}
