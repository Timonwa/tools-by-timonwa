"use client";

import type {
	DraftInputType,
	SeoMetaResultType,
	TokenUsageType,
} from "../types";
import { createHistoryStore } from "@/lib/utils/create-history-store";
import { createLocalStorageJson } from "@/lib/utils/local-storage-json";

const HISTORY_KEY = "article-to-seo-meta:history";
const MAX_HISTORY = 10;

export type HistoryEntryType = {
	id: string;
	/** The article source (pasted text or a URL) — stored so the user can
	 * re-load + regenerate. */
	source: DraftInputType;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
	result: SeoMetaResultType;
	usage?: TokenUsageType;
	timestamp: number;
};

/** Dedup/identity key for a source: same URL or same pasted text = same entry. */
const sourceKey = (s: DraftInputType) =>
	s.kind === "url" ? `url:${s.url.trim()}` : `text:${s.text}`;

const isSource = (v: unknown): v is DraftInputType =>
	!!v &&
	typeof v === "object" &&
	((v as DraftInputType).kind === "url" ||
		(v as DraftInputType).kind === "text");

/** Basic guard against a corrupt/edited localStorage value (not migration). */
const isEntry = (e: unknown): e is HistoryEntryType =>
	!!e &&
	typeof e === "object" &&
	typeof (e as HistoryEntryType).id === "string" &&
	isSource((e as HistoryEntryType).source);

const { load, save } = createLocalStorageJson<HistoryEntryType>(
	HISTORY_KEY,
	isEntry,
);

export const useHistory = createHistoryStore<
	HistoryEntryType,
	Omit<HistoryEntryType, "id"> & { id?: string }
>({
	read: load,
	write: save,
	// Dedup by source — regenerating the same article/URL updates the existing
	// entry rather than creating a new one.
	applyUpsert: (current, entry) => {
		const key = sourceKey(entry.source);
		const existing = current.find((h) => sourceKey(h.source) === key);
		const full: HistoryEntryType = {
			...entry,
			id: existing?.id ?? entry.id ?? crypto.randomUUID(),
		};
		const without = current.filter((h) => sourceKey(h.source) !== key);
		return [full, ...without].slice(0, MAX_HISTORY);
	},
});
