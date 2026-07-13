"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CopyButton, Input } from "@/components/ui";
import { slugify, type SlugSeparatorType } from "@/lib/text/slugify";
import { cn } from "@/lib/utils/cn";

const SEPARATORS: { value: SlugSeparatorType; label: string }[] = [
	{ value: "-", label: "hyphen ( - )" },
	{ value: "_", label: "underscore ( _ )" },
];

// Slugs have no hard limit, but shorter ones read better and don't get
// truncated in search results — a soft target, surfaced gently (not an error).
const SLUG_LENGTH_TARGET = 60;

export default function SlugGeneratorTool() {
	const [title, setTitle] = useState("");
	const [separator, setSeparator] = useState<SlugSeparatorType>("-");
	const [lowercase, setLowercase] = useState(true);
	const [removeStopWords, setRemoveStopWords] = useState(false);

	const slug = useMemo(
		() => slugify(title, { separator, lowercase, removeStopWords }),
		[title, separator, lowercase, removeStopWords],
	);

	const slugLength = slug.length;
	const wordCount = slug ? slug.split(separator).filter(Boolean).length : 0;
	const overTarget = slugLength > SLUG_LENGTH_TARGET;

	return (
		<div className="space-y-4">
			<Card>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="slug-input" className="text-sm font-medium">
							Title or headline
						</label>
						<Input
							id="slug-input"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							placeholder="10 Ways to Improve Your Writing"
							autoFocus
						/>
					</div>

					<div className="flex flex-wrap items-center gap-x-6 gap-y-3">
						<fieldset className="flex items-center gap-2">
							<legend className="sr-only">Separator</legend>
							<span className="text-sm text-muted-foreground">Separator</span>
							{SEPARATORS.map((s) => (
								<button
									key={s.value}
									type="button"
									onClick={() => setSeparator(s.value)}
									aria-pressed={separator === s.value}
									className={cn(
										"rounded-md border px-2.5 py-1 text-sm cursor-pointer",
										separator === s.value
											? "border-primary bg-primary/10 text-primary"
											: "border-border hover:bg-accent hover:text-accent-foreground",
									)}
								>
									{s.label}
								</button>
							))}
						</fieldset>
						<Toggle
							checked={lowercase}
							onChange={setLowercase}
							label="Lowercase"
						/>
						<Toggle
							checked={removeStopWords}
							onChange={setRemoveStopWords}
							label="Remove stop words"
						/>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardContent className="space-y-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm font-medium">Slug</span>
						<CopyButton value={slug} />
					</div>
					<div className="rounded-lg border border-border bg-muted/40 px-3 py-2 font-mono text-sm break-all min-h-9">
						{slug || (
							<span className="text-muted-foreground">
								your-slug-appears-here
							</span>
						)}
					</div>
					{slug && (
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
							<span
								className={cn(
									"tabular-nums",
									overTarget
										? "text-amber-600 dark:text-amber-500"
										: "text-muted-foreground",
								)}
							>
								{slugLength} / {SLUG_LENGTH_TARGET} characters · {wordCount}{" "}
								{wordCount === 1 ? "word" : "words"}
							</span>
							{overTarget && (
								<span className="text-amber-600 dark:text-amber-500">
									— shorter slugs read better
								</span>
							)}
						</div>
					)}
					<p className="text-xs text-muted-foreground break-all">
						Preview:{" "}
						<span className="text-foreground">/blog/{slug || "your-slug"}</span>
					</p>
				</CardContent>
			</Card>
		</div>
	);
}

function Toggle({
	checked,
	onChange,
	label,
}: {
	checked: boolean;
	onChange: (value: boolean) => void;
	label: string;
}) {
	return (
		<label className="flex items-center gap-2 text-sm cursor-pointer select-none">
			<input
				type="checkbox"
				checked={checked}
				onChange={(e) => onChange(e.target.checked)}
				className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
			/>
			{label}
		</label>
	);
}
