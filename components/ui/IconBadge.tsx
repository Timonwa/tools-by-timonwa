import type { ComponentType, SVGProps } from "react";

import { type TintType, TINT_ICON } from "@/lib/config/tints";
import { cn } from "@/lib/utils/cn";

type IconBadgeSize = "md" | "lg";

type IconBadgeProps = {
	icon: ComponentType<SVGProps<SVGSVGElement>>;
	/** A decorative palette hue (1–5). */
	tint?: TintType;
	/** Raw color classes when the color comes from elsewhere (e.g. a category). */
	colorClass?: string;
	size?: IconBadgeSize;
	className?: string;
};

const SIZE_CLASSES: Record<IconBadgeSize, string> = {
	md: "size-10 rounded-lg",
	lg: "size-11 rounded-xl",
};

/**
 * A rounded, tinted tile holding a single icon — the marker beside a feature,
 * step, or tool. Colors come from either a `tint` index or a raw `colorClass`
 * (used where the hue is category-driven).
 */
export default function IconBadge({
	icon: Icon,
	tint,
	colorClass,
	size = "md",
	className,
}: IconBadgeProps) {
	return (
		<span
			aria-hidden
			className={cn(
				"flex items-center justify-center",
				SIZE_CLASSES[size],
				tint ? TINT_ICON[tint] : colorClass,
				className,
			)}
		>
			<Icon className="size-5" />
		</span>
	);
}
