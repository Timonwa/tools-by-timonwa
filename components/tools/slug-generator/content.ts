import type { ToolContentType } from "@/components/_shared/content/ToolContent";

export const slugGeneratorContent: ToolContentType = {
	article: `## What is a URL slug?

A URL slug is the readable part of a web address that identifies a page — the "how-to-write-a-slug" in example.com/blog/how-to-write-a-slug. It uses real words instead of a database ID or query string, so people and search engines can tell what a page covers before they click. A slug generator turns any title, heading, product name, or phrase into that clean, URL-safe string automatically.

This tool converts your text into a slug instantly and runs entirely in your browser — nothing is uploaded. You choose the separator, whether to lowercase, and whether to drop common stop words.

## Who is the slug generator for?

- **Bloggers and content writers** — slugify post titles and section headings.
- **E-commerce and marketing teams** — slugify product, category, and campaign names.
- **Developers and site owners** — generate URL-safe identifiers for routes, files, tags, and database records.
- **Documentation authors** — turn headings into anchor links.

Anywhere text becomes part of a URL, a clean slug helps people and search engines read it.

## How to use the slug generator

1. Type or paste any text — a title, heading, product name, or tag.
2. The slug appears instantly — accents stripped (café becomes cafe), punctuation removed, spaces replaced by your separator.
3. Adjust the options: hyphen or underscore, lowercase on or off, and optional stop-word removal.
4. Copy the slug into your CMS, your code, or wherever the URL lives.

## What makes a good, SEO-friendly slug

Short, descriptive, and keyword-focused wins. Google's own [URL structure guidelines](https://developers.google.com/search/docs/crawling-indexing/url-structure) recommend simple, human-readable URLs. In practice:

- **Keep it short** — aim for under about 60 characters and three to five words.
- **Include the main keyword** or the name of the thing the page is about.
- **Use lowercase** to avoid duplicate URLs on case-sensitive servers.
- **Separate words with hyphens** (more on that below).
- **Skip stop words, dates, and IDs** that add length without meaning.

A slug like "wireless-earbuds-pro" or "beginners-guide-open-source" reads and ranks better than a long, padded string.

## Hyphens vs. underscores, and stop words

Google treats a **hyphen as a space** between words but reads an **underscore as a joiner**, so "open-source" is understood as two words while "open_source" can be read as one. That's why hyphens are the SEO-preferred separator for public URLs; underscores mostly belong in code. Removing stop words ("a," "the," "of") is optional — it shortens the slug, but keeping them is fine when they aid readability. This generator never lets stop-word removal leave you with an empty slug.

## Slug mistakes to avoid

- **Changing a live slug without a redirect** — add a 301 so existing links and ranking carry over.
- **Keyword stuffing** — repeating a term doesn't help and looks spammy.
- **Dates and version numbers** — they age the URL and undercut evergreen content.
- **Uppercase letters or spaces** — both cause inconsistent, hard-to-share links.`,
	faq: [
		{
			question: "What is a URL slug?",
			answer:
				"A URL slug is the human-readable part of a web address that identifies a page, such as “how-to-write-a-slug” in example.com/blog/how-to-write-a-slug. It uses words instead of an ID so people and search engines can understand the page before opening it.",
		},
		{
			question: "How long should a URL slug be?",
			answer:
				"There's no hard limit, but shorter is better — aim for under about 60 characters and three to five words. Short slugs are easier to read, share, and remember, and they aren't truncated in search results.",
		},
		{
			question: "Should I use hyphens or underscores in a URL?",
			answer:
				"Use hyphens. Google reads a hyphen as a space between words but treats an underscore as joining words together, so hyphens keep each word distinct and are the SEO-friendly choice for public URLs.",
		},
		{
			question: "Do URL slugs affect SEO?",
			answer:
				"Yes, modestly. A short, keyword-relevant slug helps search engines and users understand a page and can improve click-through, though content and links matter far more to ranking.",
		},
		{
			question: "Should a URL slug be lowercase?",
			answer:
				"Yes. Lowercase slugs avoid duplicate-URL problems on case-sensitive servers, where /My-Page and /my-page could be treated as two different pages. Lowercase is the safe, conventional choice.",
		},
		{
			question: "Should I remove stop words from a slug?",
			answer:
				"It's optional. Removing words like “a,” “the,” and “of” shortens the slug, which many people prefer, but keeping them is fine when they make the URL clearer. Never strip so many that the slug loses its meaning.",
		},
		{
			question: "What characters are allowed in a URL slug?",
			answer:
				"Use lowercase letters, numbers, and hyphens. Spaces, punctuation, and most symbols aren't URL-safe, and accented letters should be converted to plain equivalents (café to cafe) — which a slug generator does automatically.",
		},
		{
			question: "How do I create an SEO-friendly URL?",
			answer:
				"Start from a descriptive title or name, keep it short, include the main keyword, use lowercase with hyphens between words, and drop stop words and dates. A slug generator applies these rules to any text you give it.",
		},
		{
			question: "What is the difference between a slug and a permalink?",
			answer:
				"A slug is the word-based identifier of a single page (the “how-to-write-a-slug” part). A permalink is the full, permanent URL that contains the slug, including the domain and path. Every permalink has a slug inside it.",
		},
		{
			question: "Can I change a slug after publishing?",
			answer:
				"You can, but if the page already has traffic or backlinks, add a 301 redirect from the old URL to the new one so visitors and search ranking transfer instead of hitting a 404.",
		},
	],
};
