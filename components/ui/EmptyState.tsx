import type * as React from "react";

import { cn } from "@/lib/utils/cn";

/**
 * A dashed, centered placeholder for "nothing here yet" states — empty category
 * pages, filtered lists with no matches. One consistent border and spacing.
 */
export default function EmptyState({
	className,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			className={cn(
				"text-muted-foreground rounded-xl border border-dashed border-border p-8 text-center",
				className,
			)}
			{...props}
		/>
	);
}
