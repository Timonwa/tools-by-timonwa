"use client";

import type {
	DraftInputType,
	PlatformType,
	PreviewResultType,
	ToneType,
	WritingPreferencesType,
} from "@/components/tools/article-to-social-posts/types";
import { createHistoryStore } from "@/lib/utils/create-history-store";

const HISTORY_KEY = "article-to-social-posts:history";
const MAX_HISTORY = 10;

export type HistoryEntryType = {
	id: string;
	input: DraftInputType;
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
	preferences: WritingPreferencesType;
	templateName?: string;
	preview: PreviewResultType;
	timestamp: number;
};

/** Basic guard against a corrupt/edited localStorage value (not migration). */
const isEntry = (e: unknown): e is HistoryEntryType =>
	!!e &&
	typeof e === "object" &&
	typeof (e as HistoryEntryType).id === "string" &&
	!!(e as HistoryEntryType).input &&
	!!(e as HistoryEntryType).preview;

const load = (): HistoryEntryType[] => {
	try {
		const raw = window.localStorage.getItem(HISTORY_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw) as unknown[];
		return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
	} catch {
		return [];
	}
};

const save = (items: HistoryEntryType[]) => {
	try {
		window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
	} catch {}
};

/** Identity of an entry's source — same URL or same pasted text = same entry. */
const inputKey = (input: DraftInputType) =>
	input.kind === "url" ? `url:${input.url.trim()}` : `text:${input.text}`;

export const useHistory = createHistoryStore<
	HistoryEntryType,
	Omit<HistoryEntryType, "id"> & { id?: string }
>({
	read: load,
	write: save,
	// Dedup by source — re-generating the same article (URL or pasted text)
	// updates its entry rather than piling up a record per run.
	applyUpsert: (current, entry) => {
		const key = inputKey(entry.input);
		const existing = current.find((h) => inputKey(h.input) === key);
		const full: HistoryEntryType = {
			...entry,
			id: existing?.id ?? entry.id ?? crypto.randomUUID(),
		};
		const without = current.filter((h) => inputKey(h.input) !== key);
		return [full, ...without].slice(0, MAX_HISTORY);
	},
});
