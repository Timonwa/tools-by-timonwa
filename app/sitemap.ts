import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config/site";
import { TOOLS } from "@/lib/config/tools";
import { getAllGuides } from "@/lib/guides/loader";

/**
 * Served at /sitemap.xml. The hub home, every live tool route (derived from the
 * TOOLS config — "soon" tools are excluded until they ship), and the guides
 * index plus every guide.
 */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: SITE_URL, changeFrequency: "weekly", priority: 1 },
		...TOOLS.filter((t) => t.status !== "soon").map((t) => ({
			url: `${SITE_URL}${t.href}`,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
		{ url: `${SITE_URL}/guides`, changeFrequency: "weekly", priority: 0.7 },
		...getAllGuides().map((g) => ({
			url: `${SITE_URL}/guides/${g.slug}`,
			lastModified: g.updatedAt ?? g.publishedAt,
			changeFrequency: "monthly" as const,
			priority: 0.7,
		})),
	];
}
