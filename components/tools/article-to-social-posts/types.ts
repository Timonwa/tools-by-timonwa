export type PlatformType =
	"linkedin" | "x" | "bluesky" | "threads" | "mastodon" | "substack";

export type { DraftInputType } from "@/lib/tools/_shared/draft-input";

export type ToneType =
	"auto" | "professional" | "casual" | "educational" | "punchy";

export type PostDraftType = {
	platform: PlatformType;
	content: string;
	thread?: string[];
	hashtags: string[];
	charCount: number;
	charLimit: number;
};

export type ArticlePreviewType = {
	url: string;
	title: string;
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

export type PostLengthType = "short" | "medium" | "long";

export type WritingPreferencesType = {
	voice: VoiceType;
	emojiLevel: LevelType;
	hashtagLevel: LevelType;
	alwaysIncludeHashtags: string[];
	neverUseHashtags: string[];
	postLength: PostLengthType;
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
