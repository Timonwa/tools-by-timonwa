export type SeoVariationType = {
	title: string;
	description: string;
};

export type SeoArticleType = {
	title?: string;
	author?: string;
	url?: string;
};

export type SeoMetaResultType = {
	article?: SeoArticleType; // optional so pre-field history entries still load
	variations: SeoVariationType[];
};

export type { TokenUsageType } from "@/lib/types/token-usage";
export type { DraftInputType } from "@/lib/tools/_shared/draft-input";

export const TITLE_MIN = 50;
export const TITLE_MAX = 60;
export const DESC_MIN = 150;
export const DESC_MAX = 160;

export { MAX_ARTICLE_CHARS } from "@/lib/config/limits";
