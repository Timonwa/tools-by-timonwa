"use client";

import { useCallback, useSyncExternalStore } from "react";

import type {
	SeoMetaResultType,
	TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import { createLocalStore } from "@/lib/utils/local-store";

const HISTORY_KEY = "article-to-seo-meta:history";
const MAX_HISTORY = 10;

export type HistoryEntryType = {
	id: string;
	/** Full article text — stored so the user can re-load + regenerate. */
	article: string;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
	result: SeoMetaResultType;
	usage?: TokenUsageType;
	timestamp: number;
};

const EMPTY: HistoryEntryType[] = [];

const load = (): HistoryEntryType[] => {
	try {
		const raw = window.localStorage.getItem(HISTORY_KEY);
		if (!raw) return EMPTY;
		const parsed = JSON.parse(raw) as unknown[];
		if (!Array.isArray(parsed)) return EMPTY;
		return parsed.filter(
			(e): e is HistoryEntryType =>
				!!e &&
				typeof e === "object" &&
				typeof (e as HistoryEntryType).id === "string" &&
				typeof (e as HistoryEntryType).article === "string",
		);
	} catch {
		return EMPTY;
	}
};

const save = (items: HistoryEntryType[]) => {
	try {
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
	} catch {}
};

const store = createLocalStore<HistoryEntryType[]>({
	read: load,
	write: save,
	serverValue: EMPTY,
});

export function useHistory() {
	const history = useSyncExternalStore(
		store.subscribe,
		store.getSnapshot,
		store.getServerSnapshot,
	);

	const upsert = useCallback(
		(entry: Omit<HistoryEntryType, "id"> & { id?: string }) => {
			const current = store.get();
			// Dedup by article text — regenerating the same article updates the
			// existing entry rather than creating a new one.
			const existing = current.find((h) => h.article === entry.article);
			const full: HistoryEntryType = {
				...entry,
				id: existing?.id ?? entry.id ?? crypto.randomUUID(),
			};
			const without = current.filter((h) => h.article !== entry.article);
			store.set([full, ...without].slice(0, MAX_HISTORY));
		},
		[],
	);

	const remove = useCallback((id: string) => {
		store.set(store.get().filter((h) => h.id !== id));
	}, []);

	const clear = useCallback(() => store.set(EMPTY), []);

	return { history, upsert, remove, clear };
}
