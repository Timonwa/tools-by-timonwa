import { ChevronRightIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { SITE_URL } from "@/lib/config/site";

export type BreadcrumbItemType = { label: string; href?: Route };

/**
 * Breadcrumb trail with matching BreadcrumbList JSON-LD (eligible for the
 * breadcrumb rich result). The last item is the current page — rendered as
 * plain text with `aria-current`; earlier items link when given an `href`.
 */
export default function Breadcrumbs({
	items,
}: {
	items: BreadcrumbItemType[];
}) {
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: item.label,
			...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
		})),
	};

	return (
		<nav aria-label="Breadcrumb" className="mb-6 text-sm">
			<ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
				{items.map((item, i) => {
					const last = i === items.length - 1;
					return (
						<li key={item.label} className="flex items-center gap-1.5">
							{i > 0 && (
								<ChevronRightIcon
									aria-hidden
									className="h-3.5 w-3.5 shrink-0"
								/>
							)}
							{item.href && !last ? (
								<Link
									href={item.href}
									className="hover:text-foreground hover:underline"
								>
									{item.label}
								</Link>
							) : (
								<span
									aria-current={last ? "page" : undefined}
									className={last ? "font-medium text-foreground" : undefined}
								>
									{item.label}
								</span>
							)}
						</li>
					);
				})}
			</ol>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
				}}
			/>
		</nav>
	);
}
