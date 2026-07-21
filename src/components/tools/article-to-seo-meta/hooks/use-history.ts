"use client";

import type {
	ArticleInputType,
	SeoMetaResultType,
	TokenUsageType,
} from "@/lib/types";
import { createHistoryStore } from "@/lib/utils/create-history-store";
import { createLocalStorageJson } from "@/lib/utils/local-storage-json";

const HISTORY_KEY = "article-to-seo-meta:history";
const MAX_HISTORY = 10;

export type SeoMetaHistoryEntryType = {
	id: string;
	source: ArticleInputType;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
	result: SeoMetaResultType;
	usage?: TokenUsageType;
	timestamp: number;
};

/** Dedup/identity key for a source: same URL or same pasted text = same entry. */
const sourceKey = (s: ArticleInputType) =>
	s.kind === "url" ? `url:${s.url.trim()}` : `text:${s.text}`;

const isSource = (v: unknown): v is ArticleInputType =>
	!!v &&
	typeof v === "object" &&
	((v as ArticleInputType).kind === "url" ||
		(v as ArticleInputType).kind === "text");

/** Basic guard against a corrupt/edited localStorage value (not migration). */
const isEntry = (e: unknown): e is SeoMetaHistoryEntryType =>
	!!e &&
	typeof e === "object" &&
	typeof (e as SeoMetaHistoryEntryType).id === "string" &&
	isSource((e as SeoMetaHistoryEntryType).source);

const { load, save } = createLocalStorageJson<SeoMetaHistoryEntryType>(
	HISTORY_KEY,
	isEntry,
);

/** Article-to-SEO-Meta history hook — deduplicates by source, capped at 10 entries. */
export const useHistory = createHistoryStore<
	SeoMetaHistoryEntryType,
	Omit<SeoMetaHistoryEntryType, "id"> & { id?: string }
>({
	read: load,
	write: save,
	// Dedup by source — regenerating the same article/URL updates the existing
	// entry rather than creating a new one.
	applyUpsert: (current, entry) => {
		const key = sourceKey(entry.source);
		const existing = current.find((h) => sourceKey(h.source) === key);
		const full: SeoMetaHistoryEntryType = {
			...entry,
			id: existing?.id ?? entry.id ?? crypto.randomUUID(),
		};
		const without = current.filter((h) => sourceKey(h.source) !== key);
		return [full, ...without].slice(0, MAX_HISTORY);
	},
});
