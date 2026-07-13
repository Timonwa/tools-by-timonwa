"use client";

import type {
	SeoMetaResultType,
	TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import { createHistoryStore } from "@/lib/utils/create-history-store";

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
	try {
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
	} catch {}
};

export const useHistory = createHistoryStore<
	HistoryEntryType,
	Omit<HistoryEntryType, "id"> & { id?: string }
>({
	read: load,
	write: save,
	// Dedup by article text — regenerating the same article updates the
	// existing entry rather than creating a new one.
	applyUpsert: (current, entry) => {
		const existing = current.find((h) => h.article === entry.article);
		const full: HistoryEntryType = {
			...entry,
			id: existing?.id ?? entry.id ?? crypto.randomUUID(),
		};
		const without = current.filter((h) => h.article !== entry.article);
		return [full, ...without].slice(0, MAX_HISTORY);
	},
});
