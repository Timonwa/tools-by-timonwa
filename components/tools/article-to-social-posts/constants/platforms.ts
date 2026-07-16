import {
	AtSignIcon,
	BriefcaseIcon,
	CloudIcon,
	MailIcon,
	MessageCircleIcon,
	BirdIcon,
} from "lucide-react";

import type {
	GroupType,
	PlatformType,
} from "@/components/tools/article-to-social-posts/types";

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

/**
 * Lucide deprecated its brand icons, so we use neutral shapes and rely on
 * colors + labels for platform identity. Keep these consistent with the
 * labels/colors to avoid confusing users.
 */
export const PLATFORM_ICONS: Record<PlatformType, typeof BirdIcon> = {
	linkedin: BriefcaseIcon,
	x: BirdIcon,
	bluesky: CloudIcon,
	threads: MessageCircleIcon,
	mastodon: AtSignIcon,
	substack: MailIcon,
};

export const PLATFORM_COLORS: Record<PlatformType, string> = {
	linkedin: "text-blue-600 dark:text-blue-400",
	x: "text-foreground",
	bluesky: "text-sky-500",
	threads: "text-foreground",
	mastodon: "text-purple-500",
	substack: "text-orange-500",
};

export const GROUP_CHAR_LIMITS: Record<GroupType, number> = {
	short: 300,
	medium: 500,
	long: 3000,
};

export const GROUP_LABELS: Record<GroupType, string> = {
	short: "Short",
	medium: "Medium",
	long: "Long-form",
};
