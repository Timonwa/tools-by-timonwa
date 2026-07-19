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

import type { CategoryIdType } from "./categories";
import { ROUTES } from "./routes";

/**
 * Tools in the hub. The directory home and the navbar dropdown both read from
 * this list — adding a new tool is a single entry. `slug` must match the
 * route segment under `app/(tools)/<slug>/`; `href` is derived from it via
 * ROUTES.tool so the route pattern lives in one place. `categories` (max 3)
 * drive the /tools filter and browse-by-category; the FIRST is the primary one
 * shown in the tool's breadcrumb.
 */
export type ToolType = {
	slug: string;
	name: string;
	tagline: string;
	href: Route;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	categories: CategoryIdType[];
	status?: "live" | "soon";
};

const RAW_TOOLS: Omit<ToolType, "href">[] = [
	{
		slug: "article-to-social-posts",
		name: "Article to Social Posts",
		tagline: "Turn articles into platform-optimized social media posts.",
		icon: Share2Icon,
		categories: ["writing", "ai"],
		status: "live",
	},
	{
		slug: "article-to-seo-meta",
		name: "Article to SEO Meta",
		tagline:
			"Generate SEO-friendly title and description variations with character counts in spec.",
		icon: SearchIcon,
		categories: ["writing", "ai", "seo"],
		status: "live",
	},
	{
		slug: "word-counter",
		name: "Word & Character Counter",
		tagline:
			"Live word, character, sentence, and reading-time counts, with platform character limits.",
		icon: WholeWordIcon,
		categories: ["writing", "seo"],
		status: "live",
	},
	{
		slug: "case-converter",
		name: "Case Converter",
		tagline:
			"Switch text between UPPERCASE, Title Case, camelCase, snake_case, and more.",
		icon: CaseSensitiveIcon,
		categories: ["writing", "developer"],
		status: "live",
	},
	{
		slug: "slug-generator",
		name: "Slug Generator",
		tagline: "Turn any title or headline into a clean, URL-safe slug.",
		icon: LinkIcon,
		categories: ["writing", "seo", "developer"],
		status: "live",
	},
	{
		slug: "reading-time",
		name: "Reading Time Estimator",
		tagline:
			"Estimate reading and speaking time, with a copy-ready “X min read” label.",
		icon: ClockIcon,
		categories: ["writing"],
		status: "live",
	},
];

export const TOOLS: ToolType[] = RAW_TOOLS.map((tool) => ({
	...tool,
	href: ROUTES.tool(tool.slug),
}));

/** Live tools only (excludes "soon"), for grids, the directory, and previews. */
export const LIVE_TOOLS: ToolType[] = TOOLS.filter((t) => t.status !== "soon");

/** A tool's primary category — the first one, shown in its breadcrumb. */
export const getPrimaryCategory = (tool: ToolType): CategoryIdType =>
	tool.categories[0];

/** Live tools that belong to a category (in registry order). */
export const getToolsInCategory = (category: CategoryIdType): ToolType[] =>
	LIVE_TOOLS.filter((t) => t.categories.includes(category));

/** Look up a tool by slug (e.g. to build a tool page's breadcrumb). */
export const getToolBySlug = (slug: string): ToolType | undefined =>
	TOOLS.find((t) => t.slug === slug);
