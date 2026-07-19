import { PlusIcon } from "lucide-react";
import type { ComponentType } from "react";

import MoreTools from "./MoreTools";
import Newsletter from "./Newsletter";

type ToolFaqType = { question: string; answer: string };

/**
 * The SEO/article content block below a tool: the tool's MDX article, an FAQ
 * (with FAQPage structured data for rich results), and a "more tools" grid.
 * Server-rendered so every word is in the initial HTML and crawlable, and placed
 * under the tool so it never gets in the way of using it. Each tool's copy lives
 * in `content/tools/<slug>.mdx` — the default export is the article, the `faq`
 * export drives the disclosures and the JSON-LD.
 */
export default async function ToolContent({
	currentSlug,
}: {
	currentSlug: string;
}) {
	const mod = await import(`@/content/tools/${currentSlug}.mdx`);
	const Article = mod.default as ComponentType;
	const faq = (mod as { faq: ToolFaqType[] }).faq;

	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faq.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: { "@type": "Answer", text: f.answer },
		})),
	};

	return (
		<>
			<Newsletter className="mt-16" />

			<div className="mt-16 space-y-12 border-t border-border/60 pt-12">
				<article className="max-w-3xl">
					<Article />
				</article>

				<section aria-labelledby="faq-heading" className="max-w-3xl space-y-4">
					<h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
						Frequently asked questions
					</h2>
					<div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border">
						{faq.map((item) => (
							<details key={item.question} className="group">
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
									{item.question}
									<PlusIcon
										aria-hidden
										className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
									/>
								</summary>
								<p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">
									{item.answer}
								</p>
							</details>
						))}
					</div>
				</section>

				<MoreTools currentSlug={currentSlug} />

				<script
					type="application/ld+json"
					// FAQPage structured data — eligible for FAQ rich results.
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c"),
					}}
				/>
			</div>
		</>
	);
}
