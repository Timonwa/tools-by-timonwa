import { PLATFORM_LABELS } from "@/components/tools/article-to-social-posts/constants/platforms";
import type { PostDraftType } from "@/components/tools/article-to-social-posts/types";

const appendUrl = (body: string, articleUrl?: string): string => {
	const u = articleUrl?.trim();
	if (!u) return body;
	// Guard against the agent slipping and including the URL anyway — don't
	// emit duplicates. Exact-match is enough; partial/shortened URLs are rare
	// in generated content.
	if (body.includes(u)) return body;
	return `${body}\n\n${u}`;
};

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

export const buildCopyAll = (
	drafts: PostDraftType[],
	articleUrl?: string,
): string =>
	drafts
		.map(
			(d) =>
				`### ${d.platforms.map((p) => PLATFORM_LABELS[p]).join(" · ")}\n\n${buildCopyText(d, articleUrl)}\n`,
		)
		.join("\n---\n\n");

export { timeAgo } from "@/lib/utils/time";
