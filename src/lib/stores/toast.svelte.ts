export interface ToastMessage {
	id: number;
	kind: 'success' | 'error';
	text: string;
}

let nextId = 1;
export const toasts: ToastMessage[] = $state([]);

function push(kind: ToastMessage['kind'], text: string) {
	const id = nextId++;
	toasts.push({ id, kind, text });
	setTimeout(() => dismiss(id), 4000);
}

export function dismiss(id: number) {
	const idx = toasts.findIndex((t) => t.id === id);
	if (idx !== -1) toasts.splice(idx, 1);
}

export function toastSuccess(text: string) {
	push('success', text);
}

export function toastError(text: string) {
	push('error', text);
}
