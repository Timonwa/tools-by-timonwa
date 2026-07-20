import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/** The shared page container for every tool — owns max-width and padding so all tools align; pass `className` to override for narrower layouts. */
export default function ToolMain({
	children,
	className,
}: {
	children: ReactNode;
	className?: string;
}) {
	return (
		<main
			className={cn(
				"container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 max-w-6xl",
				className,
			)}
		>
			{children}
		</main>
	);
}
