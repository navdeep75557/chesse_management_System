import type { ApiError } from '$lib/types';

export class ApiRequestError extends Error {
	details?: Record<string, string>;
	status: number;

	constructor(status: number, message: string, details?: Record<string, string>) {
		super(message);
		this.status = status;
		this.details = details;
	}
}

/** Thin fetch wrapper that parses the API's consistent JSON error shape into a typed exception. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(path, {
		...init,
		headers: { 'Content-Type': 'application/json', ...init?.headers }
	});

	if (res.status === 204) return undefined as T;

	const body = await res.json().catch(() => ({}) as Partial<ApiError>);

	if (!res.ok) {
		throw new ApiRequestError(res.status, body.error ?? 'Request failed', body.details);
	}

	return body as T;
}

export const api = {
	get: <T>(path: string) => request<T>(path),
	post: <T>(path: string, data?: unknown) =>
		request<T>(path, { method: 'POST', body: data !== undefined ? JSON.stringify(data) : undefined }),
	put: <T>(path: string, data?: unknown) =>
		request<T>(path, { method: 'PUT', body: JSON.stringify(data) }),
	delete: <T>(path: string, data?: unknown) =>
		request<T>(path, { method: 'DELETE', body: data !== undefined ? JSON.stringify(data) : undefined })
};
