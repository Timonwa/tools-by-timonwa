import type { ToolContentType } from "@/components/_shared/ToolContent";

export const wordCounterContent: ToolContentType = {
	sections: [
		{
			heading: "What is a word and character counter?",
			body: [
				"A word and character counter is a free tool that tallies your writing in real time — words, characters with and without spaces, sentences, paragraphs, and lines — the moment you type or paste it in. Alongside the raw counts it estimates reading and speaking time and checks your text against the character limits that matter for SEO titles, meta descriptions, and social media posts. Whether you're a writer working to a word count, a student meeting an essay requirement, a marketer trimming a tweet, or a developer checking a string, it puts every number you need in one place.",
				"This word counter runs entirely in your browser. Your text is never uploaded, stored, or sent to a server — the counting happens on your own device, so even long or sensitive drafts stay completely private.",
			],
		},
		{
			heading: "Who is the word counter for?",
			body: [
				"The word counter is for anyone who writes to a limit or a target. Students use it to hit essay and assignment word counts; authors and novelists track manuscript and chapter length; journalists and copywriters work to briefs measured in words. Marketers and social media managers trim posts to fit X, LinkedIn, and Bluesky, while SEO specialists size page titles and meta descriptions to Google's display limits. Developers and translators check string lengths, and speakers estimate how long a script will take to read aloud. Because it's free, needs no account, and runs instantly in your browser, it fits into any of these workflows.",
			],
		},
		{
			heading: "How to use the word counter",
			body: [
				"Type directly into the box or paste text from anywhere — a document, an email, your CMS, or a notes app. Every count updates instantly as you write; there's no button to press and no sign-up. Watch the live word and character totals, scan the sentence and paragraph breakdown, and use the reading- and speaking-time estimates to judge length at a glance.",
				"Below the counts you'll find live character limits for common platforms. As your text grows, each limit shows how many characters you have left — or how far over you are — so you can tighten a headline to fit an SEO title, keep a meta description in Google's sweet spot, or trim a post to fit X or Bluesky before you publish. When it looks right, copy your text and paste it wherever it needs to go.",
			],
		},
		{
			heading: "Why word and character counts matter",
			body: [
				"Length is rarely arbitrary. Google typically truncates page titles at around 60 characters and meta descriptions at roughly 150-160, so writing to those limits keeps your search snippet from being cut off. Social platforms enforce hard caps — 280 characters on X (Twitter), 300 on Bluesky, and 3,000 on a LinkedIn post — and going over means your message is clipped or rejected.",
				"Word count matters just as much for readers. Academic assignments, journalism briefs, and content guidelines are usually set in words, and reading time — calculated from your word count at an average reading speed — tells you whether a piece is a quick skim or a long read. Keeping an eye on these numbers while you write helps you hit the target the first time instead of editing to length afterward.",
			],
		},
		{
			heading: "What the word counter measures",
			body: [
				"Words are counted as runs of characters separated by spaces, so a hyphenated term counts as one word and numbers count as words. Characters are counted by Unicode code point, which means an emoji or an accented letter counts as a single character — matching what most platforms report. “Characters without spaces” strips all whitespace and counts only the visible characters, which is useful when a limit ignores spaces. Sentences are split on periods, exclamation marks, and question marks, and paragraphs on blank lines, giving you a quick structural read while you draft.",
			],
		},
	],
	faq: [
		{
			question: "How do I count the number of words in a text?",
			answer:
				"Paste or type your text into the box and the word count updates instantly — no button or sign-up needed. Words are counted as sequences of characters separated by spaces, so hyphenated words and numbers each count as one word.",
		},
		{
			question:
				"What is the difference between characters with and without spaces?",
			answer:
				"“Characters” counts everything you type, including spaces, tabs, and line breaks. “Characters without spaces” removes all whitespace and counts only the visible characters. Some platforms and assignments measure one way or the other, so both are shown.",
		},
		{
			question: "How many characters can an X (Twitter) post have?",
			answer:
				"A standard X post allows 280 characters. Bluesky allows 300 and a LinkedIn post allows 3,000. The counter shows how many characters you have left for each limit as you type.",
		},
		{
			question:
				"What is the ideal length for an SEO title and meta description?",
			answer:
				"Aim for about 50-60 characters for a page title and 150-160 for a meta description. Beyond those, Google usually truncates the text in search results. The counter flags both limits live so you can write to them.",
		},
		{
			question: "How is reading time calculated?",
			answer:
				"Reading time is your word count divided by an average adult reading speed of about 200-250 words per minute. Speaking time uses a slower conversational pace of around 130 words per minute.",
		},
		{
			question: "How many words is a one-minute or five-minute read?",
			answer:
				"At roughly 225 words per minute, a one-minute read is about 225 words and a five-minute read is around 1,100-1,200 words. The exact figure varies with reading speed and how difficult the text is.",
		},
		{
			question: "Does this word counter store or upload my text?",
			answer:
				"No. The counter runs entirely in your browser and never sends your text to a server. Nothing is uploaded, saved, or logged, so even long or private drafts stay on your device.",
		},
		{
			question: "How does the word counter count sentences and paragraphs?",
			answer:
				"Sentences are counted by splitting on ending punctuation — periods, exclamation marks, and question marks. Paragraphs are counted as blocks of text separated by blank lines. Both are quick structural estimates rather than a full grammar analysis.",
		},
	],
};
