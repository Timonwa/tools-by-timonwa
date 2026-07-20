import type { Metadata } from "next";

import {
	CREATOR_NAME,
	CREATOR_SAME_AS,
	CREATOR_TWITTER,
	CREATOR_URL,
	REPO_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";

const TOOL_PATH = "/reading-time";
const TOOL_URL = `${SITE_URL}${TOOL_PATH}`;
const TOOL_TITLE = "Reading Time Estimator — how long an article takes to read";
const TOOL_DESCRIPTION =
	"Paste an article for its reading and speaking time, with adjustable speed and a copy-ready “X min read” label. Free, no sign-up, runs in your browser.";

export const metadata: Metadata = {
	title: TOOL_TITLE,
	description: TOOL_DESCRIPTION,
	applicationName: "Reading Time Estimator",
	alternates: { canonical: TOOL_PATH },
	openGraph: {
		type: "website",
		url: TOOL_URL,
		siteName: SITE_NAME,
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
	name: "Reading Time Estimator",
	alternateName: "Reading Time Calculator",
	url: TOOL_URL,
	description: TOOL_DESCRIPTION,
	applicationCategory: "UtilitiesApplication",
	applicationSubCategory: "Text tool",
	operatingSystem: "Any",
	browserRequirements: "Requires JavaScript. Requires a modern browser.",
	offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
	isAccessibleForFree: true,
	inLanguage: "en",
	keywords: [
		"reading time estimator",
		"reading time calculator",
		"how long to read",
		"words per minute",
		"speaking time calculator",
		"min read label",
		"open source reading time",
	].join(", "),
	featureList: [
		"Estimate reading and speaking time from any text",
		"Adjustable reading speed (slow, average, fast)",
		"Copy-ready “X min read” label for blog posts",
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

export default function ReadingTimeLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="tool-reading-time contents">
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
