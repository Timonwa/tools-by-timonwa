import { PlusIcon } from "lucide-react";
import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import MoreTools from "./MoreTools";
import Newsletter from "@/components/marketing/Newsletter";

export type ToolFaqType = { question: string; answer: string };

export type ToolContentType = {
	/** Article body authored as Markdown (headings, lists, bold, links). */
	article: string;
	/** FAQs — plain text, rendered as disclosures and emitted as FAQPage JSON-LD. */
	faq: ToolFaqType[];
};

/**
 * Markdown → styled elements. Links that point off-site (absolute http URLs)
 * open in a new tab; in-app relative links stay in the same tab.
 */
const markdownComponents: Components = {
	h2: ({ children }) => (
		<h2 className="mt-10 text-xl font-semibold tracking-tight first:mt-0">
			{children}
		</h2>
	),
	h3: ({ children }) => (
		<h3 className="mt-6 text-lg font-semibold">{children}</h3>
	),
	p: ({ children }) => (
		<p className="mt-3 leading-relaxed text-muted-foreground">{children}</p>
	),
	ul: ({ children }) => (
		<ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground marker:text-muted-foreground/60">
			{children}
		</ul>
	),
	ol: ({ children }) => (
		<ol className="mt-3 list-decimal space-y-1.5 pl-5 text-muted-foreground">
			{children}
		</ol>
	),
	li: ({ children }) => <li className="leading-relaxed">{children}</li>,
	strong: ({ children }) => (
		<strong className="font-semibold text-foreground">{children}</strong>
	),
	blockquote: ({ children }) => (
		<blockquote className="mt-4 border-l-2 border-border pl-4 italic">
			{children}
		</blockquote>
	),
	a: ({ href, children }) => {
		const external = /^https?:\/\//.test(href ?? "");
		return (
			<a
				href={href}
				className="font-medium text-primary underline underline-offset-2 hover:no-underline"
				{...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
			>
				{children}
			</a>
		);
	},
};

/**
 * The SEO/article content block below a tool: a Markdown article, an FAQ (with
 * FAQPage structured data for rich results), and a "more tools" grid. Server-
 * rendered so every word is in the initial HTML and crawlable, and placed under
 * the tool so it never gets in the way of using it.
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
		<>
			<Newsletter className="mt-16" />

			<div className="mt-16 space-y-12 border-t border-border/60 pt-12">
				<article className="max-w-3xl">
					<ReactMarkdown
						remarkPlugins={[remarkGfm]}
						components={markdownComponents}
					>
						{content.article}
					</ReactMarkdown>
				</article>

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
		</>
	);
}
