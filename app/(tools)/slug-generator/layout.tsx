import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/slug-generator";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Slug Generator — turn any title into a clean URL slug";
const TOOL_DESCRIPTION =
	"Turn a title or headline into a clean, URL-safe slug. Strips accents and punctuation, with options for the separator, lowercasing, and dropping stop words. Free, no sign-up, runs in your browser.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Slug Generator",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: "Slug Generator",
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
	name: "Slug Generator",
	alternateName: "URL Slug Generator",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "Utility",
	applicationSubCategory: "SEO tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"slug generator",
		"url slug generator",
		"title to slug",
		"seo slug",
		"permalink generator",
		"open source slug generator",
	].join(", "),
	featureList: [
		"Turn a title or headline into a clean, URL-safe slug",
		"Strips accents and punctuation",
		"Choose a hyphen or underscore separator",
		"Optional lowercasing and stop-word removal",
		"One-click copy, live preview",
		"Runs entirely in your browser — nothing is uploaded",
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

export default function SlugGeneratorLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-slug-generator contents">
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
