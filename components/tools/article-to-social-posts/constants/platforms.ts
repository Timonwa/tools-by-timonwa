import type { ComponentType, SVGProps } from "react";

import {
	BlueskyLogo,
	LinkedInLogo,
	MastodonLogo,
	SubstackLogo,
	ThreadsLogo,
	XLogo,
} from "@/components/icons/brand";
import type { PlatformType } from "../types";

export const ALL_PLATFORMS: PlatformType[] = [
	"linkedin",
	"x",
	"bluesky",
	"threads",
	"mastodon",
	"substack",
];

/** Platforms that support multi-post threads (LinkedIn and Substack don't). */
export const THREADABLE_PLATFORMS: PlatformType[] = [
	"x",
	"bluesky",
	"threads",
	"mastodon",
];

export const PLATFORM_LABELS: Record<PlatformType, string> = {
	linkedin: "LinkedIn",
	x: "X (Twitter)",
	bluesky: "Bluesky",
	threads: "Threads",
	mastodon: "Mastodon",
	substack: "Substack Notes",
};

/**
 * Max characters allowed per post on each platform.
 * Substack Notes has no hard limit but the UI encourages short posts;
 * 500 keeps drafts snappy and consistent with the medium-community group.
 */
export const CHAR_LIMITS: Record<PlatformType, number> = {
	linkedin: 3000,
	x: 280,
	bluesky: 300,
	threads: 500,
	mastodon: 500,
	substack: 500,
};

/** Real brand marks per platform (see `components/icons/brand`). */
export const PLATFORM_ICONS: Record<
	PlatformType,
	ComponentType<SVGProps<SVGSVGElement>>
> = {
	linkedin: LinkedInLogo,
	x: XLogo,
	bluesky: BlueskyLogo,
	threads: ThreadsLogo,
	mastodon: MastodonLogo,
	substack: SubstackLogo,
};

export const PLATFORM_COLORS: Record<PlatformType, string> = {
	linkedin: "text-blue-600 dark:text-blue-400",
	x: "text-foreground",
	bluesky: "text-sky-500",
	threads: "text-foreground",
	mastodon: "text-purple-500",
	substack: "text-orange-500",
};
