import type {
	PostDensityLevelType,
	PostPlatformType,
	LongformPostLengthType,
	PostToneType,
	PostVoiceType,
} from "@/lib/constants";
import type { ArticleInputType, ArticleMetaType } from "./article";
import type { TokenUsageType } from "./token-usage";

export type PostDraftType = {
	platform: PostPlatformType;
	content: string;
	thread?: string[];
	hashtags: string[];
	charCount: number;
	charLimit: number;
};

export type PostDraftsResultType = {
	article: ArticleMetaType;
	drafts: PostDraftType[];
	usage: TokenUsageType;
};

export type PostPreferencesType = {
	voice: PostVoiceType;
	emojiLevel: PostDensityLevelType;
	hashtagLevel: PostDensityLevelType;
	alwaysIncludeHashtags: string[];
	neverUseHashtags: string[];
	postLength: LongformPostLengthType;
};

export type PostPresetType = {
	id: string;
	name: string;
	createdAt: number;
	tone: PostToneType;
	platforms: PostPlatformType[];
	xThreadLength: number;
	preferences: PostPreferencesType;
};

/** One saved run — shared by every social-post tool's history (each under its own storage key). */
export type PostHistoryType = {
	id: string;
	input: ArticleInputType;
	tone: PostToneType;
	platforms: PostPlatformType[];
	xThreadLength: number;
	preferences: PostPreferencesType;
	presetName?: string;
	preview: PostDraftsResultType;
	timestamp: number;
};
