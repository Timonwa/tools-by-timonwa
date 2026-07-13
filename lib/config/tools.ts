import type { Route } from "next";
import { SearchIcon, Share2Icon } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/**
 * Tools in the hub. The directory home and the navbar dropdown both read from
 * this list — adding a new tool is a single entry. `slug` must match the
 * route segment under `app/(tools)/<slug>/`.
 */
export type ToolType = {
	slug: string;
	name: string;
	tagline: string;
	href: Route;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	status?: "live" | "soon";
};

export const TOOLS: ToolType[] = [
	{
		slug: "article-to-social-posts",
		name: "Article to Social Posts",
		tagline: "Turn articles into platform-optimized social media posts.",
		href: "/article-to-social-posts",
		icon: Share2Icon,
		status: "live",
	},
	{
		slug: "article-to-seo-meta",
		name: "Article to SEO Meta",
		tagline:
			"Generate SEO-friendly title and description variations with character counts in spec.",
		href: "/article-to-seo-meta",
		icon: SearchIcon,
		status: "live",
	},
];
