import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/article-to-seo-meta";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE =
	"Article to SEO Meta — SEO titles and descriptions with counts in spec";
const TOOL_DESCRIPTION =
	"Paste an article draft and get 1-3 SEO title + description variations sized to Google's display limits (50-60 / 150-160 chars). Optional primary keyword included in every variation.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Article to SEO Meta",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: "Article to SEO Meta",
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
	name: "Article to SEO Meta",
	alternateName: "SEO Meta Generator",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "DeveloperApplication",
	applicationSubCategory: "SEO tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"SEO title generator",
		"SEO meta description generator",
		"meta description 160 characters",
		"SEO title 60 characters",
		"article to SEO",
		"primary keyword in title",
		"open source SEO tool",
	].join(", "),
	featureList: [
		"Generate 1-3 SEO title + description variations from any article draft",
		"Strict character ranges: titles 50-60, descriptions 150-160",
		"Optional primary keyword included in every variation",
		"Per-field character counter with in-range, close, or out-of-range indicators",
		"Copy title, description, or both in one click",
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

export default function ArticleToSeoMetaLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-article-to-seo-meta contents">
			<script
				type="application/ld+json"
				// JSON-LD structured data per Next.js docs
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
			{children}
		</div>
	);
}
