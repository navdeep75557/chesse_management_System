import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	// Clean slate so the seed script is repeatable during local development.
	await prisma.match.deleteMany();
	await prisma.tournamentPlayer.deleteMany();
	await prisma.tournament.deleteMany();
	await prisma.player.deleteMany();

	const players = await Promise.all(
		[
			{ name: 'Magnus Carlsen', email: 'magnus@example.com', rating: 2830 },
			{ name: 'Fabiano Caruana', email: 'fabiano@example.com', rating: 2800 },
			{ name: 'Hikaru Nakamura', email: 'hikaru@example.com', rating: 2780 },
			{ name: 'Ding Liren', email: 'ding@example.com', rating: 2760 },
			{ name: 'Ian Nepomniachtchi', email: 'ian@example.com', rating: 2750 },
			{ name: 'Alireza Firouzja', email: 'alireza@example.com', rating: 2740 },
			{ name: 'Anish Giri', email: 'anish@example.com', rating: 2720 },
			{ name: 'Wesley So', email: 'wesley@example.com', rating: 2700 },
			{ name: 'Levon Aronian', email: 'levon@example.com', rating: 2690 },
			{ name: 'Viswanathan Anand', email: 'vishy@example.com', rating: 2750 }
		].map((data) => prisma.player.create({ data }))
	);

	const tournament = await prisma.tournament.create({
		data: {
			name: 'Spring Grandmaster Invitational',
			startDate: new Date('2026-08-01'),
			endDate: new Date('2026-08-10'),
			status: 'upcoming',
			maxPlayers: 16
		}
	});

	await prisma.tournamentPlayer.createMany({
		data: players.map((p) => ({ tournamentId: tournament.id, playerId: p.id }))
	});

	console.log(`Seeded ${players.length} players and tournament "${tournament.name}" (id ${tournament.id}).`);
	console.log('No matches were generated — use the "Generate Matches" button on the tournament page to start round 1.');
}

main()
	.catch((err) => {
		console.error('Seed failed:', err);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
