"use client";

import { useCallback, useSyncExternalStore } from "react";

import type {
	DraftInputType,
	PlatformType,
	PreviewResultType,
	ToneType,
} from "@/components/tools/article-to-social-posts/types";
import { createLocalStore } from "@/lib/utils/local-store";

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

const EMPTY: HistoryEntryType[] = [];

const load = (): HistoryEntryType[] => {
	try {
		const raw = window.localStorage.getItem(HISTORY_KEY);
		if (!raw) return EMPTY;
		const parsed = JSON.parse(raw) as unknown[];
		if (!Array.isArray(parsed)) return EMPTY;
		return parsed.map(migrate).filter((e): e is HistoryEntryType => e !== null);
	} catch {
		return EMPTY;
	}
};

const save = (items: HistoryEntryType[]) => {
	try {
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
	} catch {}
};

const sameUrl = (entry: HistoryEntryType, url: string) =>
	entry.input.kind === "url" && entry.input.url === url;

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
				store.set([full, ...without].slice(0, MAX_HISTORY));
				return;
			}
			const full: HistoryEntryType = {
				...entry,
				id: entry.id ?? crypto.randomUUID(),
			};
			store.set([full, ...current].slice(0, MAX_HISTORY));
		},
		[],
	);

	const remove = useCallback((id: string) => {
		store.set(store.get().filter((h) => h.id !== id));
	}, []);

	return { history, upsert, remove };
}
