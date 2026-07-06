import { ValidationError } from './errors';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parses a route param as a positive integer id, throwing a ValidationError if it isn't one. */
export function parseIdParam(raw: string | undefined, paramName = 'id'): number {
	const id = Number(raw);
	if (!raw || !Number.isInteger(id) || id <= 0) {
		throw new ValidationError(`Invalid ${paramName}: must be a positive integer`);
	}
	return id;
}

export interface PlayerInputRaw {
	name?: unknown;
	email?: unknown;
	rating?: unknown;
}

export interface ValidatedPlayerInput {
	name: string;
	email: string;
	rating: number;
}

/** Validates and normalizes a player create/update payload, throwing a ValidationError with field-level details on failure. */
export function validatePlayerInput(input: PlayerInputRaw): ValidatedPlayerInput {
	const details: Record<string, string> = {};

	const name = typeof input.name === 'string' ? input.name.trim() : '';
	if (name.length < 2) {
		details.name = 'Name is required and must be at least 2 characters';
	}

	const email = typeof input.email === 'string' ? input.email.trim() : '';
	if (!EMAIL_REGEX.test(email)) {
		details.email = 'A valid email address is required';
	}

	let rating = 1200;
	if (input.rating !== undefined && input.rating !== null && input.rating !== '') {
		const parsed = Number(input.rating);
		if (!Number.isInteger(parsed) || parsed <= 0) {
			details.rating = 'Rating must be a positive integer';
		} else {
			rating = parsed;
		}
	}

	if (Object.keys(details).length > 0) {
		throw new ValidationError('Validation failed', details);
	}

	return { name, email, rating };
}

export interface TournamentInputRaw {
	name?: unknown;
	startDate?: unknown;
	endDate?: unknown;
	status?: unknown;
	maxPlayers?: unknown;
}

export interface ValidatedTournamentInput {
	name: string;
	startDate: Date;
	endDate: Date;
	status: 'upcoming' | 'ongoing' | 'completed';
	maxPlayers: number;
}

const VALID_STATUSES = ['upcoming', 'ongoing', 'completed'];

/** Validates and normalizes a tournament create/update payload, throwing a ValidationError with field-level details on failure. */
export function validateTournamentInput(input: TournamentInputRaw): ValidatedTournamentInput {
	const details: Record<string, string> = {};

	const name = typeof input.name === 'string' ? input.name.trim() : '';
	if (name.length < 2) {
		details.name = 'Name is required and must be at least 2 characters';
	}

	const startDate = new Date(input.startDate as string);
	if (isNaN(startDate.getTime())) {
		details.startDate = 'A valid start date is required';
	}

	const endDate = new Date(input.endDate as string);
	if (isNaN(endDate.getTime())) {
		details.endDate = 'A valid end date is required';
	}

	if (!details.startDate && !details.endDate && endDate <= startDate) {
		details.endDate = 'End date must be after start date';
	}

	let maxPlayers = 0;
	const parsedMax = Number(input.maxPlayers);
	if (!Number.isInteger(parsedMax) || parsedMax < 2) {
		details.maxPlayers = 'Max players must be an integer of at least 2';
	} else {
		maxPlayers = parsedMax;
	}

	let status: ValidatedTournamentInput['status'] = 'upcoming';
	if (input.status !== undefined) {
		if (typeof input.status !== 'string' || !VALID_STATUSES.includes(input.status)) {
			details.status = `Status must be one of: ${VALID_STATUSES.join(', ')}`;
		} else {
			status = input.status as ValidatedTournamentInput['status'];
		}
	}

	if (Object.keys(details).length > 0) {
		throw new ValidationError('Validation failed', details);
	}

	return { name, startDate, endDate, status, maxPlayers };
}
