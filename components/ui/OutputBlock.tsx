import type { ElementType, HTMLAttributes } from "react";

import { cn } from "@/lib/utils/cn";

type OutputBlockProps = HTMLAttributes<HTMLElement> & {
	/** The element to render — e.g. `dd` inside a `<dl>`, or `pre` for code. */
	as?: ElementType;
};

const BASE =
	"rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm break-all";

/**
 * A read-only monospace surface for generated output — hashes, slugs, snippets.
 * One radius, border, background, and font across every tool's result area.
 * Pass `as` to keep semantics (e.g. a `dd`); override wrapping via `className`.
 */
export default function OutputBlock({
	as: Tag = "div",
	className,
	...props
}: OutputBlockProps) {
	return <Tag className={cn(BASE, className)} {...props} />;
}
