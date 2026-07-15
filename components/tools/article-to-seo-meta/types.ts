export type SeoVariationType = {
	title: string;
	description: string;
};

export type SeoMetaResultType = {
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
