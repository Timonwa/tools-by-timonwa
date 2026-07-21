"use client";

import { ToggleButton } from "@/components/ui";

import { POST_TONES } from "@/lib/constants";
import type { PostToneType } from "@/lib/constants";

type TonePickerProps = {
	value: PostToneType;
	onChange: (tone: PostToneType) => void;
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
				{POST_TONES.map((t) => (
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
