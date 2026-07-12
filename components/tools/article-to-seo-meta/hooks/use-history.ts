"use client";

import { useCallback, useEffect, useState } from "react";

import type {
	SeoMetaResultType,
	TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";

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

const load = (): HistoryEntryType[] => {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown[];
		if (!Array.isArray(parsed)) return [];
		return parsed.filter(
			(e): e is HistoryEntryType =>
				!!e &&
				typeof e === "object" &&
				typeof (e as HistoryEntryType).id === "string" &&
				typeof (e as HistoryEntryType).article === "string",
		);
	} catch {
		return [];
	}
};

const save = (items: HistoryEntryType[]) => {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
	} catch {}
};

export function useHistory() {
	const [history, setHistory] = useState<HistoryEntryType[]>([]);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		setHistory(load());
		setLoaded(true);
	}, []);

	// Guard prevents saving the empty initial state before localStorage is loaded,
	// which would wipe history on every mount.
	useEffect(() => {
		if (!loaded) return;
		save(history);
	}, [history, loaded]);

	const upsert = useCallback(
		(entry: Omit<HistoryEntryType, "id"> & { id?: string }) => {
			setHistory((current) => {
				// Dedup by article text — regenerating the same article updates the
				// existing entry rather than creating a new one.
				const existing = current.find((h) => h.article === entry.article);
				const full: HistoryEntryType = {
					...entry,
					id: existing?.id ?? entry.id ?? crypto.randomUUID(),
				};
				const without = current.filter((h) => h.article !== entry.article);
				return [full, ...without].slice(0, MAX_HISTORY);
			});
		},
		[],
	);

	const remove = useCallback((id: string) => {
		setHistory((cur) => cur.filter((h) => h.id !== id));
	}, []);

	const clear = useCallback(() => setHistory([]), []);

	return { history, upsert, remove, clear };
}
