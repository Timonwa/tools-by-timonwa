"use client";

import { useMemo, useState } from "react";

import {
	Card,
	CardContent,
	CopyButton,
	Input,
	OutputBlock,
	SegmentedControl,
} from "@/components/ui";
import { TINT_TEXT } from "@/lib/config/tints";
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
		<div className="flex flex-col gap-4">
			<Card>
				<CardContent className="flex flex-col gap-4">
					<div className="flex flex-col gap-2">
						<label htmlFor="slug-input" className="text-sm font-medium">
							Title or text
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
						<fieldset className="flex min-w-0 items-center flex-wrap gap-2">
							<legend className="sr-only">Separator</legend>
							<span className="text-sm text-muted-foreground">Separator</span>
							<SegmentedControl
								value={separator}
								onChange={setSeparator}
								options={SEPARATORS}
								ariaLabel="Separator"
							/>
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
				<CardContent className="flex flex-col gap-3">
					<div className="flex items-center justify-between gap-3">
						<span className="text-sm font-medium">Slug</span>
						<CopyButton value={slug} />
					</div>
					<OutputBlock className="min-h-9">
						{slug || (
							<span className="text-muted-foreground">
								your-slug-appears-here
							</span>
						)}
					</OutputBlock>
					{slug && (
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
							<span
								className={cn(
									"tabular-nums",
									overTarget ? TINT_TEXT[2] : "text-muted-foreground",
								)}
							>
								{slugLength} / {SLUG_LENGTH_TARGET} characters · {wordCount}{" "}
								{wordCount === 1 ? "word" : "words"}
							</span>
							{overTarget && (
								<span className={TINT_TEXT[2]}>
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
