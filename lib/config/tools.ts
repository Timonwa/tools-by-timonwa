import type { Route } from "next";
import {
	CaseSensitiveIcon,
	ClockIcon,
	LinkIcon,
	SearchIcon,
	Share2Icon,
	WholeWordIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { ROUTES } from "./routes";

/**
 * Tools in the hub. The directory home and the navbar dropdown both read from
 * this list — adding a new tool is a single entry. `slug` must match the
 * route segment under `app/(tools)/<slug>/`; `href` is derived from it via
 * ROUTES.tool so the route pattern lives in one place.
 */
export type ToolType = {
	slug: string;
	name: string;
	tagline: string;
	href: Route;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	status?: "live" | "soon";
};

const RAW_TOOLS: Omit<ToolType, "href">[] = [
	{
		slug: "article-to-social-posts",
		name: "Article to Social Posts",
		tagline: "Turn articles into platform-optimized social media posts.",
		icon: Share2Icon,
		status: "live",
	},
	{
		slug: "article-to-seo-meta",
		name: "Article to SEO Meta",
		tagline:
			"Generate SEO-friendly title and description variations with character counts in spec.",
		icon: SearchIcon,
		status: "live",
	},
	{
		slug: "word-counter",
		name: "Word & Character Counter",
		tagline:
			"Live word, character, sentence, and reading-time counts, with platform character limits.",
		icon: WholeWordIcon,
		status: "live",
	},
	{
		slug: "case-converter",
		name: "Case Converter",
		tagline:
			"Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more.",
		icon: CaseSensitiveIcon,
		status: "live",
	},
	{
		slug: "slug-generator",
		name: "Slug Generator",
		tagline: "Turn any title or headline into a clean, URL-safe slug.",
		icon: LinkIcon,
		status: "live",
	},
	{
		slug: "reading-time",
		name: "Reading Time Estimator",
		tagline:
			"Estimate reading and speaking time, with a copy-ready “X min read” label.",
		icon: ClockIcon,
		status: "live",
	},
];

export const TOOLS: ToolType[] = RAW_TOOLS.map((tool) => ({
	...tool,
	href: ROUTES.tool(tool.slug),
}));
