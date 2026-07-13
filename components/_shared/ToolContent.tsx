import { PlusIcon } from "lucide-react";

import MoreTools from "@/components/_shared/MoreTools";

export type ToolFaqType = { question: string; answer: string };

export type ToolContentType = {
	/** Prose sections rendered below the tool — the SEO body copy. */
	sections: { heading: string; body: string[] }[];
	/** FAQs — rendered as disclosures and emitted as FAQPage JSON-LD. */
	faq: ToolFaqType[];
};

/**
 * The SEO content block below a tool: prose sections, an FAQ (with FAQPage
 * structured data for rich results), and a "more tools" grid. Server-rendered
 * so every word is in the initial HTML and crawlable. Sits under the tool so it
 * never gets in the way of using it.
 */
export default function ToolContent({
	content,
	currentSlug,
}: {
	content: ToolContentType;
	currentSlug: string;
}) {
	const faqJsonLd = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: content.faq.map((f) => ({
			"@type": "Question",
			name: f.question,
			acceptedAnswer: { "@type": "Answer", text: f.answer },
		})),
	};

	return (
		<div className="mt-16 space-y-12 border-t border-border/60 pt-12">
			<div className="max-w-3xl space-y-8">
				{content.sections.map((section) => (
					<section key={section.heading} className="space-y-3">
						<h2 className="text-xl font-semibold tracking-tight">
							{section.heading}
						</h2>
						{section.body.map((paragraph) => (
							<p
								key={paragraph.slice(0, 40)}
								className="leading-relaxed text-muted-foreground"
							>
								{paragraph}
							</p>
						))}
					</section>
				))}
			</div>

			<section aria-labelledby="faq-heading" className="max-w-3xl space-y-4">
				<h2 id="faq-heading" className="text-xl font-semibold tracking-tight">
					Frequently asked questions
				</h2>
				<div className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border">
					{content.faq.map((item) => (
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
	);
}
