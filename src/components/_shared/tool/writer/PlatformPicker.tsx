"use client";

import { ToggleButton } from "@/components/ui";

import {
	POST_PLATFORMS,
	POST_PLATFORM_COLORS,
	POST_PLATFORM_LABELS,
} from "@/lib/constants";
import type { PostPlatformType } from "@/lib/constants";
import { PLATFORM_ICONS } from "@/components/ui/logos";

type PlatformPickerProps = {
	value: PostPlatformType[];
	onToggle: (platform: PostPlatformType) => void;
	disabled?: boolean;
};

export default function PlatformPicker({
	value,
	onToggle,
	disabled,
}: PlatformPickerProps) {
	return (
		<fieldset className="min-w-0 border-0 p-0">
			<legend className="text-sm font-medium mb-2">Platforms</legend>
			<div className="flex gap-2 flex-wrap">
				{POST_PLATFORMS.map((p) => {
					const Icon = PLATFORM_ICONS[p];
					const active = value.includes(p);
					return (
						<ToggleButton
							key={p}
							active={active}
							aria-pressed={active}
							onClick={() => onToggle(p)}
							disabled={disabled}
						>
							<Icon
								aria-hidden
								className={`w-4 h-4 ${POST_PLATFORM_COLORS[p]}`}
							/>
							{POST_PLATFORM_LABELS[p]}
						</ToggleButton>
					);
				})}
			</div>
		</fieldset>
	);
}
