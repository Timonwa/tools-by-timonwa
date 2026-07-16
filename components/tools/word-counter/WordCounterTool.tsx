"use client";

import { useId, useMemo } from "react";

import DraftReuseControls from "@/components/_shared/DraftReuseControls";
import SharedDraftLinkNotice from "@/components/_shared/SharedDraftLinkNotice";
import { useToolDraft } from "@/components/_shared/shared-draft";
import { Card, CardContent, Textarea } from "@/components/ui";
import { getTextCounts } from "@/lib/text/counts";
import {
	durationSeconds,
	formatDuration,
	READING_WPM,
	SPEAKING_WPM,
} from "@/lib/text/reading-time";
import { cn } from "@/lib/utils/cn";

const PLATFORM_LIMITS: { label: string; limit: number }[] = [
	{ label: "SEO title", limit: 60 },
	{ label: "Meta description", limit: 160 },
	{ label: "X / Twitter post", limit: 280 },
	{ label: "Bluesky post", limit: 300 },
	{ label: "LinkedIn post", limit: 3000 },
];

const numberFmt = new Intl.NumberFormat("en-US");

export default function WordCounterTool() {
	const { text, setText, reuse, toggleReuse, clear, sharedDraftIsUrl } =
		useToolDraft();
	const reuseId = useId();
	const counts = useMemo(() => getTextCounts(text), [text]);

	const stats = [
		{ label: "Words", value: counts.words },
		{ label: "Characters", value: counts.characters },
		{ label: "Characters (no spaces)", value: counts.charactersNoSpaces },
		{ label: "Sentences", value: counts.sentences },
		{ label: "Paragraphs", value: counts.paragraphs },
		{ label: "Lines", value: counts.lines },
	];

	const readTime = formatDuration(
		durationSeconds(counts.words, READING_WPM.average),
	);
	const speakTime = formatDuration(durationSeconds(counts.words, SPEAKING_WPM));

	return (
		<div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
			<Card className="min-w-0 self-start">
				<CardContent className="space-y-3">
					{sharedDraftIsUrl && <SharedDraftLinkNotice />}
					<div className="flex flex-col gap-2">
						<label htmlFor="counter-input" className="text-sm font-medium">
							Your text
						</label>
						<Textarea
							id="counter-input"
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder="Paste or type your text…"
							className="min-h-64 max-h-96 overflow-y-auto"
						/>
					</div>
					<DraftReuseControls
						id={reuseId}
						reuse={reuse}
						onToggleReuse={toggleReuse}
						onClear={clear}
						canClear={text.length > 0}
					/>
				</CardContent>
			</Card>

			<div className="@container min-w-0 space-y-6">
				<section aria-label="Counts" className="space-y-2">
					<h2 className="text-sm font-medium text-muted-foreground">Counts</h2>
					<dl className="grid grid-cols-2 gap-3 @lg:grid-cols-3">
						{stats.map((s) => (
							<div
								key={s.label}
								className="flex flex-col-reverse items-start justify-end gap-1 rounded-xl border border-border bg-card px-4 py-3"
							>
								<dt className="text-xs text-muted-foreground">{s.label}</dt>
								<dd className="text-2xl font-bold tabular-nums leading-none">
									{numberFmt.format(s.value)}
								</dd>
							</div>
						))}
					</dl>
				</section>

				<section aria-label="Estimated time" className="space-y-2">
					<h2 className="text-sm font-medium text-muted-foreground">
						Estimated time
					</h2>
					<dl className="grid gap-3 @xl:grid-cols-2">
						<DurationCard
							label="Reading time"
							value={readTime}
							hint={`~${READING_WPM.average} words/min`}
						/>
						<DurationCard
							label="Speaking time"
							value={speakTime}
							hint={`~${SPEAKING_WPM} words/min`}
						/>
					</dl>
				</section>

				<section aria-label="Character limits" className="space-y-2">
					<h2 className="text-sm font-medium text-muted-foreground">
						Character limits
					</h2>
					<dl className="grid gap-2">
						{PLATFORM_LIMITS.map((p) => {
							const remaining = p.limit - counts.characters;
							const over = remaining < 0;
							return (
								<div
									key={p.label}
									className="flex flex-col gap-0.5 rounded-lg border border-border bg-card px-3 py-2 text-sm @sm:flex-row @sm:items-baseline @sm:justify-between @sm:gap-3"
								>
									<dt className="text-muted-foreground">{p.label}</dt>
									<dd className="flex items-baseline gap-2 tabular-nums whitespace-nowrap">
										<span className="font-medium">
											{numberFmt.format(counts.characters)} /{" "}
											{numberFmt.format(p.limit)}
										</span>
										<span
											className={cn(
												"text-xs",
												over ? "text-destructive" : "text-muted-foreground",
											)}
										>
											{over
												? `${numberFmt.format(Math.abs(remaining))} over`
												: `${numberFmt.format(remaining)} left`}
										</span>
									</dd>
								</div>
							);
						})}
					</dl>
				</section>
			</div>
		</div>
	);
}

function DurationCard({
	label,
	value,
	hint,
}: {
	label: string;
	value: string;
	hint: string;
}) {
	return (
		<div className="flex flex-col-reverse gap-1 rounded-xl border border-border bg-card px-4 py-3">
			<dt className="text-xs text-muted-foreground">{label}</dt>
			<dd className="flex items-baseline justify-between gap-2">
				<span className="text-lg font-semibold">{value}</span>
				<span className="shrink-0 text-xs text-muted-foreground">{hint}</span>
			</dd>
		</div>
	);
}
