"use client";

import { ToggleButton } from "@/components/ui";

import { TONES } from "@/lib/tools/_shared/generator/constants/tones";
import type { ToneType } from "@/lib/tools/_shared/generator/types";

type TonePickerProps = {
	value: ToneType;
	onChange: (tone: ToneType) => void;
	disabled?: boolean;
};

export default function TonePicker({
	value,
	onChange,
	disabled,
}: TonePickerProps) {
	return (
		<fieldset className="min-w-0 border-0 p-0">
			<legend className="text-sm font-medium mb-2">Tone</legend>
			<div className="flex flex-wrap gap-2">
				{TONES.map((t) => (
					<ToggleButton
						key={t.value}
						size="sm"
						active={value === t.value}
						aria-pressed={value === t.value}
						onClick={() => onChange(t.value)}
						disabled={disabled}
						className="grow basis-32 flex-col items-start gap-0.5 py-2 text-left"
					>
						<div className="font-medium">{t.label}</div>
						<div className="text-muted-foreground text-[11px] leading-tight">
							{t.description}
						</div>
					</ToggleButton>
				))}
			</div>
		</fieldset>
	);
}
