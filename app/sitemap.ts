import type { MetadataRoute } from "next";

import { TOOL_CATEGORIES } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { SITE_URL } from "@/lib/config/site";
import { getToolsInCategory, TOOLS } from "@/lib/config/tools";
import { getAllGuides } from "@/lib/guides/loader";

/**
 * Served at /sitemap.xml. The hub home, the tool directory, the categories index
 * plus each non-empty category page, every live tool route (derived from the
 * TOOLS config — "soon" tools are excluded until they ship), and the guides
 * index plus every guide.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: SITE_URL, changeFrequency: "weekly", priority: 1 },
		{
			url: `${SITE_URL}${ROUTES.tools}`,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}${ROUTES.categories}`,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...TOOL_CATEGORIES.filter((c) => getToolsInCategory(c.id).length > 0).map(
			(c) => ({
				url: `${SITE_URL}${ROUTES.category(c.id)}`,
				changeFrequency: "weekly" as const,
				priority: 0.6,
			}),
		),
		...TOOLS.filter((t) => t.status !== "soon").map((t) => ({
			url: `${SITE_URL}${t.href}`,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		{
			url: `${SITE_URL}${ROUTES.guides}`,
			changeFrequency: "weekly",
			priority: 0.7,
		},
		...getAllGuides().map((g) => ({
			url: `${SITE_URL}${ROUTES.guide(g.slug)}`,
			lastModified: g.updatedAt ?? g.publishedAt,
			changeFrequency: "monthly" as const,
			priority: 0.7,
		})),
	];
}
