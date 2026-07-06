import { json } from '@sveltejs/kit';

/**
 * Base class for errors that should be surfaced to the client with a
 * specific HTTP status code and a clear message (as opposed to unexpected
 * bugs, which should be logged and reported as a generic 500).
 */
export class HttpError extends Error {
	status: number;
	details?: Record<string, string>;

	constructor(status: number, message: string, details?: Record<string, string>) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

export class ValidationError extends HttpError {
	constructor(message: string, details?: Record<string, string>) {
		super(400, message, details);
	}
}

export class NotFoundError extends HttpError {
	constructor(message: string) {
		super(404, message);
	}
}

export class ConflictError extends HttpError {
	constructor(message: string, details?: Record<string, string>) {
		super(409, message, details);
	}
}

/**
 * Wraps an API route handler so every route returns the same JSON error
 * shape ({ error, details? }) with the right status code, whether the
 * failure is an expected business-rule error (HttpError) or an unexpected
 * exception (logged and reported as 500).
 */
export function withErrorHandling(handler: () => Promise<Response>): Promise<Response> {
	return handler().catch((err) => {
		if (err instanceof HttpError) {
			return json({ error: err.message, ...(err.details ? { details: err.details } : {}) }, { status: err.status });
		}

		console.error('Unhandled API error:', err);
		return json({ error: 'Internal server error' }, { status: 500 });
	});
}
