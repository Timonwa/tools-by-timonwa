import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

/**
 * Shared page container for every tool. One place owns the max width and
 * padding so all tools line up. Pass `className` to override the width for a
 * simpler tool (e.g. a narrow single-input tool) — `cn` lets a `max-w-*`
 * utility here win over the default.
 */
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
