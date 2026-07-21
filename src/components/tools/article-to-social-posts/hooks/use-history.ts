"use client";

import { createToolHistory } from "@/lib/tools/_shared/generator/create-tool-history";
import type { PostHistoryType } from "@/lib/types";

/** Basic guard against a corrupt/edited localStorage value (not migration). */
const isEntry = (e: unknown): e is PostHistoryType =>
	!!e &&
	typeof e === "object" &&
	typeof (e as PostHistoryType).id === "string" &&
	!!(e as PostHistoryType).input &&
	!!(e as PostHistoryType).preview;

/** Article-to-Social-Posts history — its own localStorage namespace. */
export const useHistory = createToolHistory<PostHistoryType>({
	key: "article-to-social-posts:history",
	isEntry,
});
