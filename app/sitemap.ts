import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/config/site";
import { TOOLS } from "@/lib/config/tools";

/**
 * Served at /sitemap.xml. The hub home plus every live tool route (derived from
 * the TOOLS config — "soon" tools are excluded until they ship).
 */
export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{ url: SITE_URL, changeFrequency: "weekly", priority: 1 },
		...TOOLS.filter((t) => t.status !== "soon").map((t) => ({
			url: `${SITE_URL}${t.href}`,
			changeFrequency: "monthly" as const,
			priority: 0.8,
		})),
	];
}
