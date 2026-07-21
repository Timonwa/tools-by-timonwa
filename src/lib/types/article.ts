// This file is shared by the tools that collect article metadata (title/author/url) from either a URL or pasted text.

/** Article input type — either a URL or pasted text. */
export type ArticleInputType =
	{ kind: "url"; url: string } | { kind: "text"; text: string };

/** Article input kind type — either "url" or "text". */
export type ArticleInputKindType = ArticleInputType["kind"];

/** Parsed article metadata (title/author/url) extracted from a URL or pasted text — shared by the post and SEO tools. */
export type ArticleMetaType = {
	title?: string;
	author?: string;
	url?: string;
};
