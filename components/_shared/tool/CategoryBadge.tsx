import { type CategoryIdType, getCategory } from "@/lib/config/categories";
import { cn } from "@/lib/utils/cn";

/** A small, non-interactive category pill (icon + label) shown on tool cards. */
export default function CategoryBadge({
	category,
}: {
	category: CategoryIdType;
}) {
	const { label, icon: Icon, color } = getCategory(category);
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
				color.badge,
			)}
		>
			<Icon aria-hidden className="h-3 w-3" />
			{label}
		</span>
	);
}
