import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

const CARD_BASE =
	"group relative flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all";
const CARD_INTERACTIVE =
	"hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5";

type LinkCardProps = {
	href: Route;
	/** Render as a non-interactive, dimmed card (e.g. a "coming soon" tool). */
	disabled?: boolean;
	className?: string;
	children: ReactNode;
};

/**
 * Shared wrapper for the tool and guide cards so they share one border, shadow,
 * and hover-lift. Adds the `group` class, so children can animate on hover
 * (e.g. an arrow with `group-hover:translate-x-0.5`).
 */
export default function LinkCard({
	href,
	disabled,
	className,
	children,
}: LinkCardProps) {
	if (disabled) {
		return (
			<div
				aria-disabled
				className={cn(CARD_BASE, "cursor-not-allowed opacity-60", className)}
			>
				{children}
			</div>
		);
	}
	return (
		<Link href={href} className={cn(CARD_BASE, CARD_INTERACTIVE, className)}>
			{children}
		</Link>
	);
}
