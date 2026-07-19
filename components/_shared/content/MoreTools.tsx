import ToolGrid from "@/components/_shared/tool/ToolGrid";
import { LIVE_TOOLS } from "@/lib/config/tools";

/**
 * "More tools" grid shown at the bottom of a tool page — other live tools as
 * internal links (good for discovery and SEO). Reads from the TOOLS config so
 * new tools appear automatically.
 */
export default function MoreTools({
	currentSlug,
	max = 3,
}: {
	currentSlug: string;
	max?: number;
}) {
	const others = LIVE_TOOLS.filter((t) => t.slug !== currentSlug).slice(0, max);
	if (others.length === 0) return null;

	return (
		<section aria-labelledby="more-tools-heading" className="space-y-4">
			<h2
				id="more-tools-heading"
				className="text-xl font-semibold tracking-tight"
			>
				More tools
			</h2>
			<ToolGrid tools={others} />
		</section>
	);
}
