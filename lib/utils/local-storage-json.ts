"use client";

/**
 * Read/write a validated JSON array in localStorage. Both accessors swallow
 * errors (private-mode writes, corrupt values, quota) and fall back to an empty
 * list, so a bad stored value never crashes a tool. Pair with a type guard to
 * drop any entry that doesn't match the current shape.
 */
export function createLocalStorageJson<T>(
	key: string,
	guard: (value: unknown) => value is T,
): { load: () => T[]; save: (items: T[]) => void } {
	return {
		load: () => {
			try {
				const raw = window.localStorage.getItem(key);
				if (!raw) return [];
				const parsed = JSON.parse(raw) as unknown[];
				return Array.isArray(parsed) ? parsed.filter(guard) : [];
			} catch {
				return [];
			}
		},
		save: (items: T[]) => {
			try {
				window.localStorage.setItem(key, JSON.stringify(items));
			} catch {}
		},
	};
}
