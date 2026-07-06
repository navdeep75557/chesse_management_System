// Shared types used by both server (API routes/services) and client (Svelte pages/components).
// These mirror the Prisma models but use plain, JSON-serializable shapes
// (e.g. dates as ISO strings) since they cross the network as fetch responses.

export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Player {
	id: number;
	name: string;
	email: string;
	rating: number;
	createdAt: string;
}

export interface Tournament {
	id: number;
	name: string;
	startDate: string;
	endDate: string;
	status: TournamentStatus;
	maxPlayers: number;
	createdAt: string;
	playerCount?: number;
}

export interface TournamentPlayer {
	id: number;
	tournamentId: number;
	playerId: number;
	enrolledAt: string;
	player: Player;
}

export interface Match {
	id: number;
	tournamentId: number;
	player1Id: number;
	player2Id: number | null;
	winnerId: number | null;
	round: number;
	playedAt: string | null;
	createdAt: string;
	player1?: Player;
	player2?: Player | null;
	winner?: Player | null;
}

export interface RankingEntry {
	rank: number;
	player: Player;
	wins: number;
	losses: number;
	gamesPlayed: number;
}

// Payloads for create/update requests (client -> API).

export interface PlayerInput {
	name: string;
	email: string;
	rating?: number;
}

export interface TournamentInput {
	name: string;
	startDate: string;
	endDate: string;
	status?: TournamentStatus;
	maxPlayers: number;
}

// Consistent JSON error shape returned by every API route on failure.
export interface ApiError {
	error: string;
	details?: Record<string, string>;
}
