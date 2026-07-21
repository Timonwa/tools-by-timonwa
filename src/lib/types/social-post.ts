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

/** How posts should sound — sticky, reusable voice. Saved and switched via style templates. */
export type PostStyleType = {
	voice: PostVoiceType;
	tone: PostToneType;
	emojiLevel: PostDensityLevelType;
	hashtagLevel: PostDensityLevelType;
	alwaysIncludeHashtags: string[];
	neverUseHashtags: string[];
	postLength: LongformPostLengthType;
};

/** A named, reusable writing style — e.g. one per blog or client. Stores style only; platforms and thread length are per-run workflow, never saved here. */
export type PostStyleTemplateType = {
	id: string;
	name: string;
	createdAt: number;
	style: PostStyleType;
};

/** One saved run — shared by every social-post tool's history (each under its own storage key). */
export type PostHistoryType = {
	id: string;
	input: ArticleInputType;
	style: PostStyleType;
	platforms: PostPlatformType[];
	xThreadLength: number;
	styleTemplateName?: string;
	preview: PostDraftsResultType;
	timestamp: number;
};
