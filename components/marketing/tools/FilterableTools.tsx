"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import ToolGrid from "@/components/_shared/tool/ToolGrid";
import { type CategoryIdType, TOOL_CATEGORIES } from "@/lib/config/categories";
import { LIVE_TOOLS } from "@/lib/config/tools";
import { cn } from "@/lib/utils/cn";

/** Categories that actually have a live tool — empty ones never show a chip. */
const PRESENT = TOOL_CATEGORIES.filter((c) =>
	LIVE_TOOLS.some((t) => t.categories.includes(c.id)),
);
const VALID = new Set<CategoryIdType>(PRESENT.map((c) => c.id));

const countIn = (category: CategoryIdType) =>
	LIVE_TOOLS.filter((t) => t.categories.includes(category)).length;

function FilterChip({
	label,
	count,
	active,
	icon,
	activeClass,
	onClick,
}: {
	label: string;
	count: number;
	active: boolean;
	icon?: React.ReactNode;
	/** Category color classes for the active state; falls back to the theme accent. */
	activeClass?: string;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-pressed={active}
			onClick={onClick}
			className={cn(
				"inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
				active
					? (activeClass ?? "border-primary bg-primary/10 text-primary")
					: "border-border text-muted-foreground hover:bg-accent hover:text-foreground",
			)}
		>
			{icon}
			{label}
			<span className="text-xs opacity-70">{count}</span>
		</button>
	);
}

/**
 * The tool directory's category filter + grid. The active category lives in the
 * URL (`?category=…`) so filtered views are shareable and the breadcrumb on each
 * tool page can deep-link straight into a filtered directory.
 */
export default function FilterableTools() {
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();

	const raw = params.get("category");
	const active =
		raw && VALID.has(raw as CategoryIdType) ? (raw as CategoryIdType) : null;

	const tools = active
		? LIVE_TOOLS.filter((t) => t.categories.includes(active))
		: LIVE_TOOLS;

	const select = (category: CategoryIdType | null) => {
		const url = category ? `${pathname}?category=${category}` : pathname;
		router.replace(url as Route, { scroll: false });
	};

	return (
		<div className="space-y-6">
			<div
				role="group"
				aria-label="Filter tools by category"
				className="flex flex-wrap gap-2"
			>
				<FilterChip
					label="All"
					count={LIVE_TOOLS.length}
					active={active === null}
					onClick={() => select(null)}
				/>
				{PRESENT.map((category) => {
					const Icon = category.icon;
					return (
						<FilterChip
							key={category.id}
							label={category.label}
							count={countIn(category.id)}
							active={active === category.id}
							activeClass={category.color.badge}
							icon={<Icon aria-hidden className="h-3.5 w-3.5" />}
							onClick={() => select(category.id)}
						/>
					);
				})}
			</div>

			<ToolGrid tools={tools} />
		</div>
	);
}
