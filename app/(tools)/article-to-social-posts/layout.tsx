import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/article-to-social-posts";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Article to Social Posts — Turn articles into social posts";
const TOOL_DESCRIPTION =
	"Paste an article URL or draft. Article to Social Posts drafts platform-optimized posts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack. Open source.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Article to Social Posts",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: "Article to Social Posts",
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		site: CREATOR_TWITTER,
		creator: CREATOR_TWITTER,
		title: TOOL_TITLE,
		description: TOOL_DESCRIPTION,
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: "Article to Social Posts",
	alternateName: "Article to Social",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "WriterApplication",
	applicationSubCategory: "Social media content tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"article to social",
		"social media post generator",
		"article to tweet",
		"article to LinkedIn",
		"AI social media writer",
		"multi-platform social posts",
		"X thread generator",
		"Bluesky post generator",
		"Threads post generator",
		"Mastodon post generator",
		"Substack Notes generator",
		"open source writer tool",
		"bring your own key",
		"Gemini API",
	].join(", "),
	featureList: [
		"Paste an article URL or unpublished draft (up to 2,500 words)",
		"Generate drafts for X, LinkedIn, Threads, Bluesky, Mastodon, and Substack Notes",
		"Tone control: auto, professional, casual, educational, punchy",
		"Voice, emoji density, hashtag density preferences",
		"X thread generator with configurable length",
		"Custom always-include and never-use hashtag rules",
		"Save named templates for repeat workflows",
		"Regenerate a single platform's draft without re-fetching",
		"Edit drafts inline with live character counters",
		"Local history across sessions",
		"Bring Your Own Key (Google AI Studio / Gemini) for unlimited use",
		"Copy-only by design — no OAuth, no publishing credentials stored",
		"Open source, MIT licensed",
	],
	creator: {
		"@type": "Person",
		name: CREATOR_NAME,
		url: CREATOR_URL,
		sameAs: CREATOR_SAME_AS,
	},
	sameAs: [REPO_URL],
};

export default function ArticleToSocialPostsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-article-to-social-posts contents">
			<script
				type="application/ld+json"
				// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data per Next.js docs
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			{children}
		</div>
	);
}
