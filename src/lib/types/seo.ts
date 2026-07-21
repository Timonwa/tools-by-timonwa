import type { ArticleMetaType } from "./article";

export type SeoVariationType = {
	title: string;
	description: string;
};

export type SeoMetaResultType = {
	article?: ArticleMetaType;
	variations: SeoVariationType[];
};
