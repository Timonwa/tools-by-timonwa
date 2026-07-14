/**
 * Shared, client-safe guide types + helpers — no filesystem access, so this is
 * safe to import from client components. The guide *list* is discovered from
 * the content directory by lib/guides/loader.ts (server-only); its shape must
 * stay in sync with the frontmatter schema there. Route helpers live in
 * lib/config/routes.ts (ROUTES.guide).
 */
export type GuideMeta = {
	slug: string;
	/** Full title — hero H1 and the base of the SEO <title>. */
	title: string;
	/** Trailing portion of the title rendered in the hero gradient (a suffix of `title`). */
	titleAccent: string;
	/** Small label above the hero title and on the OG image. */
	eyebrow: string;
	/** One-sentence summary — hero subtitle, meta description, and index-card blurb. */
	description: string;
	/** SEO keywords. */
	keywords: string[];
	/** Grouping label shown on the index card (e.g. "Setup"). */
	category: string;
	/** Rough read length in minutes, shown on the index card. */
	readingMinutes: number;
	/** ISO date (YYYY-MM-DD). */
	publishedAt: string;
	/** ISO date of the last meaningful edit, if different from publish. */
	updatedAt?: string;
	/** Short subtitle for the OG image (the full `description` is usually too long). */
	ogSubtitle: string;
	/** Up to three short pills for the OG image. */
	ogPills: string[];
	/** Accent + background hex for the OG image. */
	ogAccent: string;
	ogBackgroundTint: string;
};

/**
 * Slugs of guides linked to directly from app code (not just from content), so
 * the string lives in one place rather than being retyped at each call site.
 * Must match a filename in content/guides/.
 */
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
