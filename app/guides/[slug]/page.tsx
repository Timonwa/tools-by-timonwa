import { BookOpenTextIcon, KeyRoundIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import HubNavbar from "@/components/layout/HubNavbar";
import PageMain from "@/components/layout/PageMain";
import Newsletter from "@/components/_shared/content/Newsletter";
import { PageHero } from "@/components/ui";
import {
	CREATOR_NAME,
	CREATOR_TWITTER,
	CREATOR_URL,
	SITE_NAME,
	SITE_URL,
} from "@/lib/config/site";
import { ROUTES } from "@/lib/config/routes";
import { splitGuideTitle } from "@/lib/guides/guides";
import { getGuide, getGuideSlugs } from "@/lib/guides/loader";

// Known guide slugs are prerendered; an unknown slug falls through to the
// notFound() below. (`dynamicParams` can't be set alongside cacheComponents.)
export function generateStaticParams() {
	return getGuideSlugs().map((slug) => ({ slug }));
}

type GuidePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({
	params,
}: GuidePageProps): Promise<Metadata> {
	const { slug } = await params;
	const guide = getGuide(slug);
	if (!guide) return {};

	const path = ROUTES.guide(slug);
	const url = `${SITE_URL}${path}`;
	const title = guide.title;

	return {
		title,
		description: guide.description,
		keywords: guide.keywords,
		alternates: { canonical: path },
		openGraph: {
			type: "article",
			url,
			siteName: SITE_NAME,
			title,
			description: guide.description,
			locale: "en_US",
			publishedTime: guide.publishedAt,
			modifiedTime: guide.updatedAt ?? guide.publishedAt,
			authors: [CREATOR_URL],
		},
		twitter: {
			card: "summary_large_image",
			site: CREATOR_TWITTER,
			creator: CREATOR_TWITTER,
			title,
			description: guide.description,
		},
	};
}

export default async function GuidePage({ params }: GuidePageProps) {
	const { slug } = await params;
	const guide = getGuide(slug);
	if (!guide) notFound();

	const { default: GuideBody } = await import(`@/content/guides/${slug}.mdx`);
	const { lead, accent } = splitGuideTitle(guide);

	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "TechArticle",
		headline: guide.title,
		description: guide.description,
		datePublished: guide.publishedAt,
		dateModified: guide.updatedAt ?? guide.publishedAt,
		inLanguage: "en",
		image: `${SITE_URL}${ROUTES.guide(slug)}/opengraph-image`,
		mainEntityOfPage: `${SITE_URL}${ROUTES.guide(slug)}`,
		author: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		publisher: { "@type": "Person", name: CREATOR_NAME, url: CREATOR_URL },
		keywords: guide.keywords.join(", "),
	};

	return (
		<>
			<HubNavbar />
			<PageMain>
				<div className="mx-auto max-w-3xl">
					<PageHero
						className="mb-10"
						eyebrow={{ icon: KeyRoundIcon, label: guide.eyebrow }}
						title={
							lead ? (
								<>
									{lead}
									<span className="hero-gradient-text">{accent}</span>
								</>
							) : (
								guide.title
							)
						}
						subtitle={guide.description}
					/>

					<article>
						<GuideBody />
					</article>

					<Newsletter className="mt-16" />

					<footer className="mt-16 border-t border-border/60 pt-8">
						<Link
							href={ROUTES.guides}
							className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
						>
							<BookOpenTextIcon aria-hidden className="h-4 w-4" />
							Browse all guides
						</Link>
					</footer>
				</div>

				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</PageMain>
		</>
	);
}
