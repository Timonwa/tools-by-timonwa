"use client";

import type { ArticleInputType } from "@/lib/types";
import { createHistoryStore } from "@/lib/utils/create-history-store";
import { createLocalStorageJson } from "@/lib/utils/local-storage-json";

/** Identity of an entry's source — same URL or same pasted text = same entry. */
const inputKey = (input: ArticleInputType) =>
	input.kind === "url" ? `url:${input.url.trim()}` : `text:${input.text}`;

/** Every tool keeps the same short run history. */
const MAX_HISTORY = 10;

/** Builds a deduped, localStorage-backed history hook under `key`, so each tool keeps its own separate run history (default: last 10). */
export function createToolHistory<
	Entry extends { id: string; input: ArticleInputType },
>(opts: {
	key: string;
	isEntry: (e: unknown) => e is Entry;
	maxHistory?: number;
}) {
	const { key, isEntry, maxHistory = MAX_HISTORY } = opts;
	const { load, save } = createLocalStorageJson<Entry>(key, isEntry);

	return createHistoryStore<Entry, Omit<Entry, "id"> & { id?: string }>({
		read: load,
		write: save,
		// Dedup by source — re-generating the same article updates its entry rather
		// than piling up a record per run.
		applyUpsert: (current, entry) => {
			const key = inputKey(entry.input);
			const existing = current.find((h) => inputKey(h.input) === key);
			const full = {
				...entry,
				id: existing?.id ?? entry.id ?? crypto.randomUUID(),
			} as Entry;
			const without = current.filter((h) => inputKey(h.input) !== key);
			return [full, ...without].slice(0, maxHistory);
		},
	});
}
