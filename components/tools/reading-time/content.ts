import type { ToolContentType } from "@/components/_shared/ToolContent";

export const readingTimeContent: ToolContentType = {
	sections: [
		{
			heading: "What is a reading time estimator?",
			body: [
				'A reading time estimator calculates how long a piece of text takes to read — and to read aloud — from its word count and a typical reading speed. Paste an article, a blog post, or a script and it returns a friendly figure like "6 min read," the kind you see at the top of articles on Medium and most blogs. Writers use it to gauge the length of a draft, editors to plan content, and speakers to time a talk or voiceover.',
				"The tool counts words and applies a words-per-minute rate to estimate both reading and speaking time. It runs entirely in your browser, so your text is never uploaded or stored.",
			],
		},
		{
			heading: "Who is the reading time estimator for?",
			body: [
				"The reading time estimator is for content creators who want to set reader expectations — bloggers and publications adding a “min read” label, newsletter writers checking length, and editors planning a content calendar. It's also for speakers, podcasters, and video creators who need to know how long a script will take to say aloud, and for students and professionals estimating how long a report or a set of readings will take to get through.",
			],
		},
		{
			heading: "How to use the reading time estimator",
			body: [
				'Paste or type your text and the estimate updates instantly. Choose a reading speed — slow, average, or fast — to match your audience, and you\'ll see reading time, speaking time, and the total word count side by side. A ready-made "X min read" label is provided with one-click copy, so you can drop it straight onto your post.',
			],
		},
		{
			heading: "How reading time is calculated",
			body: [
				"Reading time is simply the word count divided by a reading speed in words per minute (WPM). Research on adult reading puts the average for silent reading of non-fiction at around 238 words per minute, with most readers falling between roughly 200 and 300 WPM depending on the material's difficulty. This tool lets you pick 150 (slow), 225 (average), or 300 (fast) WPM.",
				"Speaking time uses a slower rate of about 130 words per minute, close to the pace of clear presentation or narration. That's why a script always takes longer to say than to read silently.",
			],
		},
		{
			heading: "Why add reading time to your content",
			body: [
				'A reading-time estimate sets expectations before someone commits to an article. Telling readers a post is a "4 min read" helps them choose to start now rather than bounce, and clear length cues are widely associated with better completion rates. It helps you plan, too: knowing a draft runs twelve minutes might prompt you to split it into a series or tighten it. For talks and videos, the speaking-time estimate keeps you inside your slot.',
			],
		},
	],
	faq: [
		{
			question: "How is reading time calculated?",
			answer:
				"Reading time is the number of words divided by a reading speed in words per minute. For example, 1,000 words at 225 words per minute is about a 4–5 minute read. This tool lets you choose the reading speed.",
		},
		{
			question: "What is the average reading speed?",
			answer:
				"The average adult reads silently at about 238 words per minute for non-fiction, according to reading research. Most people fall between roughly 200 and 300 words per minute depending on the text.",
		},
		{
			question: "How many words is a 5-minute read?",
			answer:
				"At an average speed of about 225 words per minute, a 5-minute read is roughly 1,100–1,200 words. Faster readers will finish the same text sooner.",
		},
		{
			question: "How long does it take to read 1,000 words?",
			answer:
				"About 4 to 5 minutes at an average reading speed of 200–250 words per minute. Denser or more technical writing takes a little longer.",
		},
		{
			question:
				"What is the difference between reading time and speaking time?",
			answer:
				"Reading time assumes silent reading at around 200–300 words per minute, while speaking time uses a slower spoken pace of about 130 words per minute. The same text always takes longer to say aloud than to read.",
		},
		{
			question: "How many words per minute does the average person read?",
			answer:
				"Around 238 words per minute for silent reading of non-fiction, based on a large meta-analysis of reading studies. Speeds vary with age, familiarity, and text difficulty.",
		},
		{
			question: "Should I show reading time on my blog?",
			answer:
				'Many popular blogs and platforms do, because it sets reader expectations and can improve engagement and completion. This tool gives you a copy-ready "X min read" label to add to your posts.',
		},
		{
			question: 'How do I add a "min read" label to my post?',
			answer:
				"Paste your article here, pick a reading speed, and copy the generated \"X min read\" label into your post's header or metadata. Update it if you significantly change the article's length.",
		},
	],
};
