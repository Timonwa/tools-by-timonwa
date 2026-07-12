export type PlatformType =
	| "linkedin"
	| "x"
	| "bluesky"
	| "threads"
	| "mastodon"
	| "substack";

export type GroupType = "short" | "medium" | "long";

/**
 * Source material for a generation request.
 * - `url`  — published article; the agent fetches + caches it for 1 hour.
 * - `text` — unpublished draft pasted directly; no fetch, no cache.
 */
export type DraftInputType =
	| { kind: "url"; url: string }
	| { kind: "text"; text: string };

export type ToneType =
	| "auto"
	| "professional"
	| "casual"
	| "educational"
	| "punchy";

export type PostDraftType = {
	group: GroupType;
	/** All selected platforms belonging to this group. */
	platforms: PlatformType[];
	/** Single-post content. For X threads, this is the joined preview (for copy). */
	content: string;
	/** Individual posts in an X thread — only present when the short group is in thread mode. */
	thread?: string[];
	hashtags: string[];
	charCount: number;
	charLimit: number;
};

export type ArticlePreviewType = {
	url: string;
	title: string;
	/** Best-effort extraction from the page — may be empty. */
	author: string;
};

import type { TokenUsageType } from "@/lib/types/token-usage";
export type { TokenUsageType };

export type PreviewResultType = {
	article: ArticlePreviewType;
	drafts: PostDraftType[];
	usage: TokenUsageType;
};

export type VoiceType = "i" | "we" | "they";

export type LevelType = 1 | 2 | 3 | 4 | 5;

export type SubstackLengthType = "medium" | "long";

export type WritingPreferencesType = {
	voice: VoiceType;
	emojiLevel: LevelType;
	hashtagLevel: LevelType;
	alwaysIncludeHashtags: string[];
	neverUseHashtags: string[];
	substackLength: SubstackLengthType;
};

export type PresetTemplateType = {
	id: string;
	name: string;
	createdAt: number;
	tone: ToneType;
	platforms: PlatformType[];
	xThreadLength: number;
	preferences: WritingPreferencesType;
};

export type { ByokModelType } from "@/lib/config/byok";
