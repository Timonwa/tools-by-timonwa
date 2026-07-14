import {
	ArrowRightIcon,
	BookOpenTextIcon,
	ClockIcon,
	WrenchIcon,
} from "lucide-react";
import type { Metadata } from "next";

import Navbar from "@/components/layout/Navbar";
import ToolMain from "@/components/layout/ToolMain";
import Newsletter from "@/components/marketing/Newsletter";
import { LinkCard, PageHero } from "@/components/ui";
import { SITE_NAME, SITE_URL } from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { getAllGuides } from "@/lib/guides/loader";

const PATH = ROUTES.guides;
const TITLE = `Guides — ${SITE_NAME}`;
const DESCRIPTION =
	"Short, practical guides for the tools — setup, tips, and step-by-step walkthroughs, including how to get a free API key.";

export const metadata: Metadata = {
	title: TITLE,
	description: DESCRIPTION,
	alternates: { canonical: PATH },
	openGraph: {
		type: "website",
		url: `${SITE_URL}${PATH}`,
		siteName: SITE_NAME,
		title: TITLE,
		description: DESCRIPTION,
		locale: "en_US",
	},
	twitter: {
		card: "summary_large_image",
		title: TITLE,
		description: DESCRIPTION,
	},
};

export default function GuidesIndexPage() {
	const guides = getAllGuides();
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		name: "Guides — Tools by Timonwa",
		itemListElement: guides.map((g, i) => ({
			"@type": "ListItem",
			position: i + 1,
			url: `${SITE_URL}${ROUTES.guide(g.slug)}`,
			name: g.title,
		})),
	};

	return (
		<>
			<Navbar
				brand={{
					href: "/",
					name: SITE_NAME,
					icon: WrenchIcon,
					ariaLabel: `${SITE_NAME} — home`,
				}}
			/>
			<ToolMain>
				<PageHero
					className="mb-10"
					eyebrow={{ icon: BookOpenTextIcon, label: "Guides" }}
					title={
						<>
							Guides &amp;{" "}
							<span className="hero-gradient-text">walkthroughs</span>
						</>
					}
					subtitle={DESCRIPTION}
				/>

				<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{guides.map((guide) => (
						<li key={guide.slug}>
							<LinkCard href={ROUTES.guide(guide.slug)}>
								<span className="text-xs font-medium uppercase tracking-wide text-primary">
									{guide.category}
								</span>
								<h2 className="mt-2 text-lg font-semibold tracking-tight">
									{guide.title}
								</h2>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
									{guide.description}
								</p>
								<span className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
									<ClockIcon aria-hidden className="h-3.5 w-3.5" />
									{guide.readingMinutes} min read
									<ArrowRightIcon
										aria-hidden
										className="ml-auto h-4 w-4 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</LinkCard>
						</li>
					))}
				</ul>

				<Newsletter className="mt-16" />

				<script
					type="application/ld+json"
					// ItemList structured data for the guides index.
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</ToolMain>
		</>
	);
}
