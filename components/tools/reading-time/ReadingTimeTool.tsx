"use client";

import { useId, useMemo, useState } from "react";

import DraftReuseControls from "@/components/_shared/DraftReuseControls";
import { useToolDraft } from "@/components/_shared/shared-draft";
import { Card, CardContent, CopyButton, Textarea } from "@/components/ui";
import { countWords } from "@/lib/text/counts";
import {
	durationSeconds,
	formatDuration,
	READING_WPM,
	readingMinutes,
	type ReadingSpeedType,
	SPEAKING_WPM,
} from "@/lib/text/reading-time";
import { cn } from "@/lib/utils/cn";

const SPEEDS: { id: ReadingSpeedType; label: string }[] = [
	{ id: "slow", label: "Slow" },
	{ id: "average", label: "Average" },
	{ id: "fast", label: "Fast" },
];

const numberFmt = new Intl.NumberFormat("en-US");

export default function ReadingTimeTool() {
	const { text, setText, textReuse, toggleTextReuse, clear } = useToolDraft();
	const [speed, setSpeed] = useState<ReadingSpeedType>("average");
	const reuseId = useId();

	const words = useMemo(() => countWords(text), [text]);
	const wpm = READING_WPM[speed];
	const readLabel = `${readingMinutes(words, wpm)} min read`;

	return (
		<div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
			<Card className="min-w-0 self-start">
				<CardContent className="space-y-3">
					<div className="flex flex-col gap-2">
						<label htmlFor="rt-input" className="text-sm font-medium">
							Your text
						</label>
						<Textarea
							id="rt-input"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Paste your article draft…"
							className="min-h-64 max-h-96 overflow-y-auto"
						/>
					</div>
					<DraftReuseControls
						id={reuseId}
						reuse={textReuse}
						onToggleReuse={toggleTextReuse}
						onClear={clear}
						canClear={text.length > 0}
					/>
				</CardContent>
			</Card>

			<div className="min-w-0 space-y-6">
				<fieldset className="min-w-0 space-y-2 border-0 p-0">
					<legend className="text-sm font-medium text-muted-foreground">
						Reading speed
					</legend>
					<div className="flex flex-wrap gap-2">
						{SPEEDS.map((s) => (
							<button
								key={s.id}
								type="button"
								onClick={() => setSpeed(s.id)}
								aria-pressed={speed === s.id}
								className={cn(
									"inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors",
									speed === s.id
										? "border-primary bg-primary/10 font-medium text-primary"
										: "border-border hover:bg-accent hover:text-accent-foreground",
								)}
							>
								{s.label}
								<span className="text-xs text-muted-foreground">
									{READING_WPM[s.id]} wpm
								</span>
							</button>
						))}
					</div>
				</fieldset>

				<dl className="grid gap-3">
					<EstimateCard
						label="Reading time"
						value={formatDuration(durationSeconds(words, wpm))}
						primary
					/>
					<EstimateCard
						label="Speaking time"
						value={formatDuration(durationSeconds(words, SPEAKING_WPM))}
					/>
					<EstimateCard label="Words" value={numberFmt.format(words)} />
				</dl>

				<Card>
					<CardContent className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<p className="text-sm font-medium">Blog label</p>
							<p className="text-xs text-muted-foreground">
								Drop this next to your post title.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<code className="rounded-md bg-muted px-2.5 py-1 text-sm">
								{readLabel}
							</code>
							<CopyButton value={readLabel} />
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function EstimateCard({
	label,
	value,
	primary,
}: {
	label: string;
	value: string;
	primary?: boolean;
}) {
	return (
		<div
			className={cn(
				"flex flex-col-reverse gap-1 rounded-xl border px-4 py-4",
				primary ? "border-primary/40 bg-primary/5" : "border-border bg-card",
			)}
		>
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd
				className={cn(
					"text-2xl font-bold leading-none",
					primary && "text-primary",
				)}
			>
				{value}
			</dd>
		</div>
	);
}
