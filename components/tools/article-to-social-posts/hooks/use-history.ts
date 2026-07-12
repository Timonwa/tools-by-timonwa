"use client";

import { useCallback, useEffect, useState } from "react";

import type {
	DraftInputType,
	PlatformType,
	PreviewResultType,
	ToneType,
} from "@/components/tools/article-to-social-posts/types";

const HISTORY_KEY = "article-to-social-posts:history";
const MAX_HISTORY = 10;

export type HistoryEntryType = {
	id: string;
	input: DraftInputType;
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
	preview: PreviewResultType;
	timestamp: number;
};

/**
 * Tolerate entries stored before the URL/draft split (they had `url` at the
 * top level instead of `input`). Synthesize an `input` for those on read;
 * the next upsert will rewrite them in the new shape.
 */
type LegacyEntryType = Omit<HistoryEntryType, "input"> & { url?: string };

const migrate = (raw: unknown): HistoryEntryType | null => {
	if (!raw || typeof raw !== "object") return null;
	const e = raw as HistoryEntryType & LegacyEntryType;
	if (e.input) return e;
	if (typeof e.url === "string" && e.url) {
		const { url, ...rest } = e;
		return { ...rest, input: { kind: "url", url } };
	}
	return null;
};

const load = (): HistoryEntryType[] => {
	if (typeof window === "undefined") return [];
	try {
		const raw = window.localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown[];
		if (!Array.isArray(parsed)) return [];
		return parsed.map(migrate).filter((e): e is HistoryEntryType => e !== null);
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

const sameUrl = (entry: HistoryEntryType, url: string) =>
	entry.input.kind === "url" && entry.input.url === url;

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
				// URL entries dedup by URL — re-generating the same article replaces
				// the previous entry. Draft entries are always fresh — each paste is
				// its own record, even if the text is identical.
				if (entry.input.kind === "url") {
					const url = entry.input.url;
					const existing = current.find((h) => sameUrl(h, url));
					const full: HistoryEntryType = {
						...entry,
						id: existing?.id ?? crypto.randomUUID(),
					};
					const without = current.filter((h) => !sameUrl(h, url));
					return [full, ...without].slice(0, MAX_HISTORY);
				}
				const full: HistoryEntryType = {
					...entry,
					id: entry.id ?? crypto.randomUUID(),
				};
				return [full, ...current].slice(0, MAX_HISTORY);
			});
		},
		[],
	);

	const remove = useCallback((id: string) => {
		setHistory((cur) => cur.filter((h) => h.id !== id));
	}, []);

	return { history, upsert, remove };
}
