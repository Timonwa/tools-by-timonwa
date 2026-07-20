// Client-safe — no filesystem access, so safe to import from client components. The guide list is discovered by lib/guides/loader.ts (server-only); this shape must stay in sync with the frontmatter schema there.

export type GuideMeta = {
	slug: string;
	title: string;
	titleAccent: string;
	eyebrow: string;
	description: string;
	keywords: string[];
	category: string;
	readingMinutes: number;
	publishedAt: string;
	updatedAt?: string;
	ogSubtitle: string;
	ogPills: string[];
	ogAccent: string;
	ogBackgroundTint: string;
};

/** Well-known guide slugs referenced from app code — single source of truth; each must match a filename in content/guides/. */
export const GUIDE_SLUGS = {
	geminiApiKey: "get-a-gemini-api-key",
} as const;

/** Split a guide title into lead + accent for the hero gradient. */
export function splitGuideTitle(
	guide: Pick<GuideMeta, "title" | "titleAccent">,
): { lead: string; accent: string } {
	const { title, titleAccent } = guide;
	if (titleAccent && title.endsWith(titleAccent)) {
		return {
			lead: title.slice(0, title.length - titleAccent.length),
			accent: titleAccent,
		};
	}
	return { lead: "", accent: title };
}
