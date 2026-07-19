import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import ToolGrid from "@/components/_shared/tool/ToolGrid";
import { buttonClasses } from "@/components/ui";
import { ROUTES } from "@/lib/config/routes";
import { LIVE_TOOLS } from "@/lib/config/tools";

/** Home only previews the first few tools; the full set lives at /tools. */
const PREVIEW_COUNT = 6;

export default function ToolsPreview() {
	const preview = LIVE_TOOLS.slice(0, PREVIEW_COUNT);
	const hasMore = LIVE_TOOLS.length > PREVIEW_COUNT;

	return (
		<section aria-labelledby="tools-heading" className="space-y-6">
			<div className="flex items-center justify-between gap-4">
				<h2
					id="tools-heading"
					className="text-sm font-medium uppercase tracking-wide text-muted-foreground"
				>
					Tools
				</h2>
				<Link
					href={ROUTES.tools}
					className={buttonClasses({ variant: "outline", size: "sm" })}
				>
					View all tools
					<ArrowRightIcon aria-hidden className="h-4 w-4" />
				</Link>
			</div>

			<ToolGrid tools={preview} />

			{hasMore && (
				<div className="flex justify-center pt-2">
					<Link
						href={ROUTES.tools}
						className={buttonClasses({ variant: "outline" })}
					>
						Browse all {LIVE_TOOLS.length} tools
						<ArrowRightIcon aria-hidden className="h-4 w-4" />
					</Link>
				</div>
			)}
		</section>
	);
}
