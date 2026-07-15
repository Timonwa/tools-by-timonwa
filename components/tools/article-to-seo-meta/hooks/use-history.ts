"use client";

import type {
	DraftInputType,
	SeoMetaResultType,
	TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import { createHistoryStore } from "@/lib/utils/create-history-store";

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

/**
 * Normalise a stored entry, lifting legacy `{ article: string }` records into
 * the current `{ source }` shape so history survives the URL-support upgrade.
 */
const migrate = (raw: unknown): HistoryEntryType | null => {
	if (!raw || typeof raw !== "object") return null;
	const e = raw as Record<string, unknown>;
	if (typeof e.id !== "string") return null;
	const source: DraftInputType | null = isSource(e.source)
		? (e.source as DraftInputType)
		: typeof e.article === "string"
			? { kind: "text", text: e.article }
			: null;
	if (!source) return null;
	return { ...(e as unknown as HistoryEntryType), source };
};

const load = (): HistoryEntryType[] => {
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
