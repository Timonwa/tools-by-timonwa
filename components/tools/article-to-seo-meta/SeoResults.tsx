"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

import {
	DESC_MAX,
	DESC_MIN,
	type SeoVariationType,
	type TokenUsageType,
	TITLE_MAX,
	TITLE_MIN,
} from "@/components/tools/article-to-seo-meta/types";
import Button from "@/components/ui/Button";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/lib/utils/cn";

type RangeStatusType = "in-range" | "close" | "out";

function status(len: number, min: number, max: number): RangeStatusType {
	if (len >= min && len <= max) return "in-range";
	const delta = len < min ? min - len : len - max;
	return delta <= 5 ? "close" : "out";
}

type Props = {
	variations: SeoVariationType[];
	usage: TokenUsageType | null;
	onVariationChange: (
		index: number,
		field: "title" | "description",
		value: string,
	) => void;
};

export default function SeoResults({
	variations,
	usage,
	onVariationChange,
}: Props) {
	return (
		<div className="space-y-4">
			{usage && usage.totalTokens > 0 && (
				<p
					title={`Prompt: ${usage.promptTokens} · Completion: ${usage.completionTokens}`}
					className="text-xs text-muted-foreground font-mono text-right"
				>
					{usage.totalTokens.toLocaleString()} tokens
				</p>
			)}
			{variations.map((v, i) => (
				<VariationCard
					// stable order
					key={i}
					index={i + 1}
					variation={v}
					onChange={(field, value) => onVariationChange(i, field, value)}
				/>
			))}
		</div>
	);
}

function VariationCard({
	index,
	variation,
	onChange,
}: {
	index: number;
	variation: SeoVariationType;
	onChange: (field: "title" | "description", value: string) => void;
}) {
	const titleStatus = status(variation.title.length, TITLE_MIN, TITLE_MAX);
	const descStatus = status(variation.description.length, DESC_MIN, DESC_MAX);

	return (
		<article className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
			<header className="flex items-center justify-between">
				<span className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
					Variation {index}
				</span>
				<CopyButton
					label="Copy both"
					value={`${variation.title}\n\n${variation.description}`}
				/>
			</header>

			<Field
				label="Title"
				value={variation.title}
				min={TITLE_MIN}
				max={TITLE_MAX}
				status={titleStatus}
				onChange={(v) => onChange("title", v)}
			/>

			<Field
				label="Description"
				value={variation.description}
				min={DESC_MIN}
				max={DESC_MAX}
				status={descStatus}
				onChange={(v) => onChange("description", v)}
			/>
		</article>
	);
}

function Field({
	label,
	value,
	min,
	max,
	status,
	onChange,
}: {
	label: string;
	value: string;
	min: number;
	max: number;
	status: RangeStatusType;
	onChange: (value: string) => void;
}) {
	const over = value.length > max;
	const under = value.length < min;

	return (
		<div>
			<div className="flex items-center justify-between gap-3 mb-1.5">
				<div className="flex items-center gap-2 min-w-0">
					<span className="text-xs font-medium text-muted-foreground">
						{label}
					</span>
					<span
						className={cn(
							"shrink-0 text-[11px] font-medium tabular-nums rounded-full px-2 py-0.5 border",
							status === "in-range" &&
								"bg-primary/10 text-primary border-primary/30",
							status === "close" &&
								"bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30",
							status === "out" &&
								"bg-destructive/10 text-destructive border-destructive/30",
						)}
					>
						{value.length} / {min}–{max}
					</span>
				</div>
				<CopyButton label="Copy" value={value} />
			</div>
			<Textarea
				aria-label={label}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className={cn(
					"resize-none text-sm min-h-0",
					(over || under) && "border-destructive focus:ring-destructive",
				)}
			/>
		</div>
	);
}

function CopyButton({ label, value }: { label: string; value: string }) {
	const [copied, setCopied] = useState(false);
	return (
		<Button
			type="button"
			variant="ghost"
			size="sm"
			onClick={() => {
				navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 1200);
			}}
		>
			{copied ? (
				<>
					<CheckIcon aria-hidden className="w-3.5 h-3.5" />
					Copied
				</>
			) : (
				<>
					<CopyIcon aria-hidden className="w-3.5 h-3.5" />
					{label}
				</>
			)}
		</Button>
	);
}
