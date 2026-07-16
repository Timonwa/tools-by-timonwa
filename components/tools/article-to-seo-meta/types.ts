export type SeoVariationType = {
	title: string;
	description: string;
};

/** The source article the metadata was written for (shown in the result card). */
export type SeoArticleType = {
	title: string;
	author: string;
	url: string;
};

export type SeoMetaResultType = {
	// Optional so a history entry saved before this field existed still loads.
	article?: SeoArticleType;
	variations: SeoVariationType[];
};

export type { TokenUsageType } from "@/lib/types/token-usage";
export type { DraftInputType } from "@/lib/tools/_shared/draft-input";

import type { DraftInputType } from "@/lib/tools/_shared/draft-input";

export type SeoMetaInputType = {
	source: DraftInputType;
	primaryKeyword?: string;
	variationCount?: 1 | 2 | 3;
};

export const TITLE_MIN = 50;
export const TITLE_MAX = 60;
export const DESC_MIN = 150;
export const DESC_MAX = 160;

export { MAX_ARTICLE_CHARS } from "@/lib/config/limits";
