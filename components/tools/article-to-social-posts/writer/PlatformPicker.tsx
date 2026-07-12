"use client";

import {
	ALL_PLATFORMS,
	PLATFORM_COLORS,
	PLATFORM_ICONS,
	PLATFORM_LABELS,
} from "@/components/tools/article-to-social-posts/constants/platforms";
import type { PlatformType } from "@/components/tools/article-to-social-posts/types";

type PlatformPickerProps = {
	value: PlatformType[];
	onToggle: (platform: PlatformType) => void;
	disabled?: boolean;
};

export default function PlatformPicker({
	value,
	onToggle,
	disabled,
}: PlatformPickerProps) {
	return (
		<div>
			<div className="text-sm font-medium mb-2">Platforms</div>
			<div className="flex gap-2 flex-wrap">
				{ALL_PLATFORMS.map((p) => {
					const Icon = PLATFORM_ICONS[p];
					const active = value.includes(p);
					return (
						<button
							key={p}
							type="button"
							aria-pressed={active}
							onClick={() => onToggle(p)}
							disabled={disabled}
							className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm transition-colors ${
								active
									? "border-primary bg-primary/10 ring-2 ring-primary"
									: "border-border bg-background hover:bg-accent"
							}`}
						>
							<Icon aria-hidden className={`w-4 h-4 ${PLATFORM_COLORS[p]}`} />
							{PLATFORM_LABELS[p]}
						</button>
					);
				})}
			</div>
		</div>
	);
}
