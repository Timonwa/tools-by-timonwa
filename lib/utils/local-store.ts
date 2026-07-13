"use client";

/**
 * A tiny localStorage-backed external store for `useSyncExternalStore`.
 *
 * Reading storage on mount via `setState` in an effect is the "you might not
 * need an Effect" anti-pattern (and trips `react-hooks/set-state-in-effect`).
 * Instead, model the persisted value as an external store: `getSnapshot`
 * returns a cached reference (stable until a write, so React doesn't loop),
 * `getServerSnapshot` returns a stable SSR fallback, and writes update the
 * cache + notify subscribers. Cross-tab `storage` events invalidate the cache.
 */
export function createLocalStore<T>(opts: {
	/** Parse the current value from storage (only called client-side). */
	read: () => T;
	/** Persist a value to storage. */
	write: (value: T) => void;
	/** Stable value returned on the server / when storage is unavailable. */
	serverValue: T;
}) {
	const canUse = () => typeof window !== "undefined";
	const listeners = new Set<() => void>();
	let cache: T = opts.serverValue;
	let loaded = false;

	const onExternalChange = () => {
		loaded = false; // a write in another tab invalidates our cache
		for (const l of listeners) l();
	};

	const getSnapshot = (): T => {
		if (!canUse()) return opts.serverValue;
		if (!loaded) {
			cache = opts.read();
			loaded = true;
		}
		return cache;
	};

	const getServerSnapshot = (): T => opts.serverValue;

	const subscribe = (listener: () => void) => {
		const first = listeners.size === 0;
		listeners.add(listener);
		if (first && canUse()) window.addEventListener("storage", onExternalChange);
		return () => {
			listeners.delete(listener);
			if (listeners.size === 0 && canUse())
				window.removeEventListener("storage", onExternalChange);
		};
	};

	/** Read the current value imperatively (e.g. inside an event handler). */
	const get = (): T => getSnapshot();

	/** Write a new value: update cache, persist, and notify subscribers. */
	const set = (value: T) => {
		cache = value;
		loaded = true;
		if (canUse()) opts.write(value);
		for (const l of listeners) l();
	};

	return { subscribe, getSnapshot, getServerSnapshot, get, set };
}
