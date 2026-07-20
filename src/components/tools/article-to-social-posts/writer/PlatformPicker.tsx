"use client";

import { ToggleButton } from "@/components/ui";

import {
	ALL_PLATFORMS,
	PLATFORM_COLORS,
	PLATFORM_ICONS,
	PLATFORM_LABELS,
} from "../constants/platforms";
import type { PlatformType } from "../types";

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
		<fieldset className="min-w-0 border-0 p-0">
			<legend className="text-sm font-medium mb-2">Platforms</legend>
			<div className="flex gap-2 flex-wrap">
				{ALL_PLATFORMS.map((p) => {
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
							<Icon aria-hidden className={`w-4 h-4 ${PLATFORM_COLORS[p]}`} />
							{PLATFORM_LABELS[p]}
						</ToggleButton>
					);
				})}
			</div>
		</fieldset>
	);
}
