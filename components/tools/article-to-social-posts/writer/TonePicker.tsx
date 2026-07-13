"use client";

import { TONES } from "@/components/tools/article-to-social-posts/constants/tones";
import type { ToneType } from "@/components/tools/article-to-social-posts/types";

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
		<div>
			<div className="text-sm font-medium mb-2">Tone</div>
			<div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
				{TONES.map((t) => (
					<button
						key={t.value}
						type="button"
						aria-pressed={value === t.value}
						onClick={() => onChange(t.value)}
						disabled={disabled}
						className={`px-2 py-2 rounded-md border text-left text-xs transition-colors ${
							value === t.value
								? "border-primary bg-primary/10 ring-2 ring-primary"
								: "border-border bg-background hover:bg-accent"
						}`}
					>
						<div className="font-medium">{t.label}</div>
						<div className="text-muted-foreground text-[11px] leading-tight">
							{t.description}
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
