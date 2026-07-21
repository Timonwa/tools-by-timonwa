import { PLATFORM_LABELS } from "@/lib/constants";
import type { PostDraftType } from "../types";

const appendUrl = (body: string, articleUrl?: string): string => {
	const u = articleUrl?.trim();
	if (!u) return body;
	// Agent sometimes emits the URL itself; skip appending to avoid a duplicate.
	// Exact-match is enough — shortened URLs are rare in generated content.
	if (body.includes(u)) return body;
	return `${body}\n\n${u}`;
};

/** Builds the clipboard string for a single draft — formats threads as numbered posts and appends the article URL. */
export const buildCopyText = (
	draft: PostDraftType,
	articleUrl?: string,
): string => {
	if (draft.thread && draft.thread.length > 1) {
		const len = draft.thread.length;
		const body = draft.thread
			.map((p, i) => `${i + 1}/${len}\n${p}`)
			.join("\n\n");
		return appendUrl(body, articleUrl);
	}
	return appendUrl(draft.content, articleUrl);
};

/** Builds a combined clipboard string for all drafts, separated by Markdown dividers. */
export const buildCopyAll = (
	drafts: PostDraftType[],
	articleUrl?: string,
): string =>
	drafts
		.map(
			(d) =>
				`### ${PLATFORM_LABELS[d.platform]}\n\n${buildCopyText(d, articleUrl)}\n`,
		)
		.join("\n---\n\n");
