import { ArrowRightIcon } from "lucide-react";

import { LinkCard } from "@/components/ui";
import type { CategoryType } from "@/lib/config/categories";
import { ROUTES } from "@/lib/config/routes";
import { LIVE_TOOLS } from "@/lib/config/tools";
import { cn } from "@/lib/utils/cn";

/**
 * A category tile — icon, label, description, and live tool count. Links into
 * the filtered `/tools` directory; empty categories render as "Coming soon".
 * Shared by the home "browse by category" section and the /categories page.
 */
export default function CategoryCard({ category }: { category: CategoryType }) {
	const Icon = category.icon;
	const count = LIVE_TOOLS.filter((t) =>
		t.categories.includes(category.id),
	).length;
	const soon = count === 0;

	return (
		<LinkCard
			href={soon ? ROUTES.categories : ROUTES.category(category.id)}
			disabled={soon}
			className={soon ? undefined : category.color.border}
		>
			<span
				aria-hidden
				className={cn(
					"mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
					category.color.chip,
				)}
			>
				<Icon className="h-5 w-5" />
			</span>
			<h3 className="mb-1 text-lg font-semibold leading-tight">
				{category.label}
			</h3>
			<p className="mb-4 flex-1 text-sm leading-snug text-muted-foreground">
				{category.description}
			</p>
			<span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
				{soon ? (
					"Coming soon"
				) : (
					<>
						{count} {count === 1 ? "tool" : "tools"}
						<ArrowRightIcon
							aria-hidden
							className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
						/>
					</>
				)}
			</span>
		</LinkCard>
	);
}
