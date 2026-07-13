import type { ToolContentType } from "@/components/_shared/ToolContent";

export const slugGeneratorContent: ToolContentType = {
	sections: [
		{
			heading: "What is a URL slug?",
			body: [
				'A URL slug is the readable part of a web address that identifies a specific page — the "how-to-write-a-slug" in example.com/blog/how-to-write-a-slug. Instead of a database ID or a string of numbers, a slug uses real words so both people and search engines can tell what the page is about before they click. A slug generator turns a title or headline into that clean, URL-safe string for you.',
				"This tool converts your title into a slug instantly and runs entirely in your browser — nothing is uploaded. You control the separator, whether to lowercase, and whether to drop common stop words.",
			],
		},
		{
			heading: "Who is the slug generator for?",
			body: [
				"The slug generator is for bloggers, content writers, and marketers creating clean permalinks for posts and landing pages, and for developers and site owners who need URL-safe identifiers for routes, files, or database records. SEO specialists use it to turn long headlines into short, keyword-focused URLs that read well in search results. If you publish anything to the web with a custom URL, a good slug is part of the job.",
			],
		},
		{
			heading: "How to use the slug generator",
			body: [
				'Type or paste a title and the slug appears immediately. Accents are stripped (café becomes cafe), punctuation is removed, and spaces become your chosen separator. Toggle lowercasing on or off, switch between a hyphen or underscore separator, and optionally remove stop words like "a," "the," and "of" to keep the slug short. When it looks right, copy it into your CMS.',
			],
		},
		{
			heading: "What makes a good, SEO-friendly slug?",
			body: [
				"Keep it short and descriptive. Google doesn't enforce a slug length, but shorter URLs are easier to read, share, and remember, and they don't get truncated in search results — aiming for under about 60 characters and three to five words is a good rule of thumb. Include your main keyword, use lowercase to avoid duplicate-URL issues on case-sensitive servers, and separate words with hyphens.",
				'Avoid padding the slug with dates, tracking parameters, or stop words that add length without meaning. A slug like "beginners-guide-open-source" reads better and ranks more cleanly than "a-complete-beginners-guide-to-the-world-of-open-source-in-2026."',
			],
		},
		{
			heading: "Hyphens vs. underscores, and stop words",
			body: [
				'Google treats hyphens as word separators but reads underscores as joiners, so "open-source" is understood as two words while "open_source" can be read as one. That\'s why hyphens are the SEO-preferred choice for public URLs; underscores mostly appear in code or when a system requires them. Removing stop words is optional — it shortens the slug, but leaving them in is fine when they aid readability. This tool never lets stop-word removal produce an empty slug.',
			],
		},
	],
	faq: [
		{
			question: "What is a URL slug?",
			answer:
				'A URL slug is the human-readable part of a web address that names a page, such as "how-to-write-a-slug" in example.com/blog/how-to-write-a-slug. It uses words instead of IDs so people and search engines can understand the page.',
		},
		{
			question: "How long should a URL slug be?",
			answer:
				"There's no hard limit, but shorter is better — aim for under about 60 characters and three to five words. Short slugs are easier to read and share and won't be truncated in search results.",
		},
		{
			question: "Should I use hyphens or underscores in a URL?",
			answer:
				"Use hyphens. Google treats hyphens as spaces between words but reads underscores as joining words together, so hyphens are the SEO-friendly choice for public URLs.",
		},
		{
			question: "Do URL slugs affect SEO?",
			answer:
				"Yes, modestly. A clean, keyword-relevant slug helps search engines and users understand the page and can improve click-through, though it's a smaller ranking factor than content and links.",
		},
		{
			question: "Should I remove stop words from a slug?",
			answer:
				'It\'s optional. Removing words like "a," "the," and "of" shortens the slug, which many people prefer, but keeping them is fine when they make the URL clearer. This tool won\'t remove them if doing so would empty the slug.',
		},
		{
			question: "What characters are allowed in a URL slug?",
			answer:
				"Stick to lowercase letters, numbers, and hyphens. Spaces, punctuation, and most symbols aren't URL-safe, and accented letters are best converted to their plain equivalents — which this generator does automatically.",
		},
		{
			question: "How do I create an SEO-friendly URL?",
			answer:
				"Start from a descriptive title, keep it short, include your main keyword, use lowercase with hyphens between words, and drop unnecessary stop words and dates. Paste your title above and the generator handles the formatting.",
		},
		{
			question: "Can I change a slug after publishing?",
			answer:
				"You can, but if the page already has traffic or backlinks, set up a 301 redirect from the old URL to the new one so you don't lose visitors or search ranking.",
		},
	],
};
