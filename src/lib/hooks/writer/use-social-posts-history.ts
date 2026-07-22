"use client";
// Hook for the Article to Social Posts tool's run history — persisted in its own localStorage namespace.

import { STORAGE_KEYS } from "@/lib/constants";
import { createToolHistory } from "@/lib/hooks/writer/create-tool-history";
import type { SocialPostHistoryType } from "@/lib/types";
import { isArticleSource } from "@/lib/utils";

/** Guards a stored value against corrupt/hand-edited localStorage (not migration). */
const isSocialPostHistoryEntry = (e: unknown): e is SocialPostHistoryType =>
	!!e &&
	typeof e === "object" &&
	typeof (e as SocialPostHistoryType).id === "string" &&
	isArticleSource((e as SocialPostHistoryType).source) &&
	!!(e as SocialPostHistoryType).result;

/** Article-to-Social-Posts history — its own localStorage namespace. */
export const useSocialPostsHistory = createToolHistory<SocialPostHistoryType>({
	key: STORAGE_KEYS.socialPostsHistory,
	isEntry: isSocialPostHistoryEntry,
});
