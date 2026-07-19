import { ArrowRightIcon } from "lucide-react";

import { LinkCard } from "@/components/ui";
import { getCategory } from "@/lib/config/categories";
import { getPrimaryCategory, type ToolType } from "@/lib/config/tools";
import { cn } from "@/lib/utils/cn";

import CategoryBadge from "./CategoryBadge";

/**
 * A single tool tile — icon, name, tagline, and its category badges. Shared by
 * the home preview, the `/tools` directory, and the "more tools" grid so every
 * tool listing looks and behaves the same. The icon tile and hover edge take the
 * primary category's color. "Soon" tools render dimmed and non-interactive.
 */
export default function ToolCard({ tool }: { tool: ToolType }) {
	const Icon = tool.icon;
	const isSoon = tool.status === "soon";
	const color = getCategory(getPrimaryCategory(tool)).color;

	return (
		<LinkCard
			href={tool.href}
			disabled={isSoon}
			className={isSoon ? undefined : color.border}
		>
			<div className="mb-4 flex items-center justify-between">
				<span
					aria-hidden
					className={cn(
						"flex h-10 w-10 items-center justify-center rounded-lg",
						color.chip,
					)}
				>
					<Icon className="h-5 w-5" />
				</span>
				{isSoon && (
					<span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
						Soon
					</span>
				)}
			</div>

			<h3 className="mb-1 text-lg font-semibold leading-tight">{tool.name}</h3>
			<p className="mb-4 flex-1 text-sm leading-snug text-muted-foreground">
				{tool.tagline}
			</p>

			<ul className="mb-4 flex flex-wrap gap-1.5">
				{tool.categories.map((category) => (
					<li key={category}>
						<CategoryBadge category={category} />
					</li>
				))}
			</ul>

			{!isSoon && (
				<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
					Open tool
					<ArrowRightIcon
						aria-hidden
						className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
					/>
				</span>
			)}
		</LinkCard>
	);
}
