"use client";

import { cn } from "@/lib/utils/cn";

type TooltipProps = {
	/** The tooltip text shown on hover/focus. */
	label: string;
	/** The trigger — usually an icon button. Keep its own `aria-label` for
	 * screen readers; this tooltip is the visual affordance only. */
	children: React.ReactNode;
	/** Which side of the trigger the bubble appears on. */
	side?: "top" | "bottom";
	/** Horizontal alignment of the bubble relative to the trigger. */
	align?: "center" | "start" | "end";
	/** Classes for the wrapper (e.g. width), not the bubble. */
	className?: string;
	/** Only reveal the bubble from `xl` up — for navbar icons that already show
	 * a text label in the collapsed (mobile) menu. */
	desktopOnly?: boolean;
};

/**
 * Lightweight CSS-only tooltip: wraps a trigger and reveals `label` on hover or
 * keyboard focus. No portal or JS state, so it works anywhere. The bubble is
 * `aria-hidden` — the trigger's own `aria-label` is the accessible name, so the
 * label isn't announced twice.
 */
export default function Tooltip({
	label,
	children,
	side = "top",
	align = "center",
	className,
	desktopOnly,
}: TooltipProps) {
	return (
		<span className={cn("group/tooltip relative inline-flex", className)}>
			{children}
			<span
				aria-hidden
				className={cn(
					"pointer-events-none absolute z-50 whitespace-nowrap rounded-md border border-border/60 bg-popover/95 px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md backdrop-blur-md opacity-0 transition-opacity duration-150 group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100",
					side === "top" ? "bottom-full mb-1.5" : "top-full mt-1.5",
					align === "center"
						? "left-1/2 -translate-x-1/2"
						: align === "start"
							? "left-0"
							: "right-0",
					desktopOnly && "hidden xl:block",
				)}
			>
				{label}
			</span>
		</span>
	);
}
