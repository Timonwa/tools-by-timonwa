"use client";

import { createToolHistory } from "@/lib/tools/_shared/generator/create-tool-history";
import type { HistoryEntryType } from "@/lib/tools/_shared/generator/types";

/** Basic guard against a corrupt/edited localStorage value (not migration). */
const isEntry = (e: unknown): e is HistoryEntryType =>
	!!e &&
	typeof e === "object" &&
	typeof (e as HistoryEntryType).id === "string" &&
	!!(e as HistoryEntryType).input &&
	!!(e as HistoryEntryType).preview;

/** Article-to-Social-Posts history — its own localStorage namespace. */
export const useHistory = createToolHistory<HistoryEntryType>({
	key: "article-to-social-posts:history",
	isEntry,
});
