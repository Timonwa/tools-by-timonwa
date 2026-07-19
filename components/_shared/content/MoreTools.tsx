import { ArrowRightIcon } from "lucide-react";

import { LinkCard } from "@/components/ui";
import { TOOLS } from "@/lib/config/tools";

/**
 * "More tools" grid shown at the bottom of a tool page — every other live tool
 * as an internal link (good for discovery and SEO). Three columns on large
 * screens. Reads from the TOOLS config so new tools appear automatically.
 */
export default function MoreTools({
	currentSlug,
	max = 3,
}: {
	currentSlug: string;
	max?: number;
}) {
	const others = TOOLS.filter(
		(t) => t.slug !== currentSlug && t.status !== "soon",
	).slice(0, max);
	if (others.length === 0) return null;

	return (
		<section aria-labelledby="more-tools-heading" className="space-y-4">
			<h2
				id="more-tools-heading"
				className="text-xl font-semibold tracking-tight"
			>
				More tools
			</h2>
			<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{others.map((t) => {
					const Icon = t.icon;
					return (
						<li key={t.slug}>
							<LinkCard href={t.href}>
								<span
									aria-hidden
									className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
								>
									<Icon className="h-5 w-5" />
								</span>
								<h3 className="mb-1 text-lg font-semibold leading-tight">
									{t.name}
								</h3>
								<p className="mb-4 flex-1 text-sm leading-snug text-muted-foreground">
									{t.tagline}
								</p>
								<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
									Open tool
									<ArrowRightIcon
										aria-hidden
										className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
									/>
								</span>
							</LinkCard>
						</li>
					);
				})}
			</ul>
		</section>
	);
}
