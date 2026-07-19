import {
	CodeIcon,
	ImageIcon,
	PenLineIcon,
	SearchIcon,
	SparklesIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

/**
 * Purposeful tool categories — the axes people actually browse by. A tool can
 * belong to several (max three); its FIRST category is the primary one used for
 * the breadcrumb. Categories drive the `/tools` filter, the home "browse by
 * category" section, and each tool page's breadcrumb.
 */
export type CategoryIdType = "writing" | "ai" | "seo" | "developer" | "media";

/**
 * Per-category color, as literal Tailwind class strings (so the scanner keeps
 * them — dynamic `bg-${x}` names would be purged). `badge` colors the pill,
 * `chip` the icon tile, and `border` the card's hover edge.
 */
export type CategoryColorType = {
	badge: string;
	chip: string;
	border: string;
};

export type CategoryType = {
	id: CategoryIdType;
	label: string;
	/** One line for the "browse by category" card and the filtered directory. */
	description: string;
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	color: CategoryColorType;
};

/** Display order for filter chips and the browse-by-category grid. */
export const TOOL_CATEGORIES: CategoryType[] = [
	{
		id: "writing",
		label: "Writing",
		description: "Draft, edit, and shape words — from counts to clean copy.",
		icon: PenLineIcon,
		color: {
			badge: "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300",
			chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
			border: "hover:border-sky-500/40",
		},
	},
	{
		id: "ai",
		label: "AI",
		description:
			"AI generators that turn an article into ready-to-use content.",
		color: {
			badge:
				"border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
			chip: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
			border: "hover:border-violet-500/40",
		},
		icon: SparklesIcon,
	},
	{
		id: "seo",
		label: "SEO",
		description: "Get found: titles, slugs, and metadata sized for search.",
		color: {
			badge:
				"border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
			chip: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
			border: "hover:border-emerald-500/40",
		},
		icon: SearchIcon,
	},
	{
		id: "developer",
		label: "Developer",
		description: "Quick, dependable utilities for everyday coding tasks.",
		color: {
			badge:
				"border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300",
			chip: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
			border: "hover:border-amber-500/40",
		},
		icon: CodeIcon,
	},
	{
		id: "media",
		label: "Media",
		description: "Images, share cards, and assets for publishing a post.",
		color: {
			badge:
				"border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300",
			chip: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
			border: "hover:border-rose-500/40",
		},
		icon: ImageIcon,
	},
];

const BY_ID = new Map(TOOL_CATEGORIES.map((c) => [c.id, c]));

export const getCategory = (id: CategoryIdType): CategoryType => {
	const category = BY_ID.get(id);
	if (!category) throw new Error(`Unknown tool category: ${id}`);
	return category;
};
