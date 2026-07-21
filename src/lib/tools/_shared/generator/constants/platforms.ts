import type { PlatformType } from "@/lib/tools/_shared/generator/types";

/** Ordered list of every supported platform. */
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

/** Max characters per post; Substack has no hard limit so 500 is enforced to keep drafts concise. */
export const CHAR_LIMITS: Record<PlatformType, number> = {
	linkedin: 3000,
	x: 280,
	bluesky: 300,
	threads: 500,
	mastodon: 500,
	substack: 500,
};

/** Tailwind text-color class for each platform's brand color. */
export const PLATFORM_COLORS: Record<PlatformType, string> = {
	linkedin: "text-blue-600 dark:text-blue-400",
	x: "text-foreground",
	bluesky: "text-sky-500",
	threads: "text-foreground",
	mastodon: "text-purple-500",
	substack: "text-orange-500",
};
