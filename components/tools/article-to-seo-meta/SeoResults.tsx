"use client";

import {
	CheckIcon,
	ClipboardCheckIcon,
	ClipboardCopyIcon,
	CopyIcon,
	Loader2Icon,
	RefreshCwIcon,
	TagsIcon,
} from "lucide-react";
import { useState } from "react";

import {
	DESC_MAX,
	DESC_MIN,
	type SeoVariationType,
	TITLE_MAX,
	TITLE_MIN,
} from "@/components/tools/article-to-seo-meta/types";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Textarea,
	Tooltip,
} from "@/components/ui";

import { cn } from "@/lib/utils/cn";

type RangeStatusType = "in-range" | "close" | "out";

function status(len: number, min: number, max: number): RangeStatusType {
	if (len >= min && len <= max) return "in-range";
	const delta = len < min ? min - len : len - max;
	return delta <= 5 ? "close" : "out";
}

type Props = {
	variations: SeoVariationType[];
	/** Index currently regenerating, or null (drives the per-card spinner). */
	regeneratingIndex: number | null;
	/** Any run in flight — disables regenerate on every card so requests can't race. */
	busy: boolean;
	onVariationChange: (
		index: number,
		field: "title" | "description",
		value: string,
	) => void;
	onRegenerate: (index: number) => void;
};

export default function SeoResults({
	variations,
	regeneratingIndex,
	busy,
	onVariationChange,
	onRegenerate,
}: Props) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
			{variations.map((v, i) => (
				<VariationCard
					// stable order
					key={i}
					index={i + 1}
					variation={v}
					isRegenerating={regeneratingIndex === i}
					canRegenerate={!busy}
					onChange={(field, value) => onVariationChange(i, field, value)}
					onRegenerate={() => onRegenerate(i)}
				/>
			))}
		</div>
	);
}

function VariationCard({
	index,
	variation,
	isRegenerating,
	canRegenerate,
	onChange,
	onRegenerate,
}: {
	index: number;
	variation: SeoVariationType;
	isRegenerating: boolean;
	canRegenerate: boolean;
	onChange: (field: "title" | "description", value: string) => void;
	onRegenerate: () => void;
}) {
	const titleStatus = status(variation.title.length, TITLE_MIN, TITLE_MAX);
	const descStatus = status(variation.description.length, DESC_MIN, DESC_MAX);

	return (
		<Card className="min-w-0">
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-base">
					<TagsIcon aria-hidden className="w-4 h-4 shrink-0 text-primary" />
					Variation {index}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
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

				<div className="flex gap-2">
					<CopyButton
						label="Copy both"
						value={`${variation.title}\n\n${variation.description}`}
						className="flex-1"
					/>
					<Tooltip label="Regenerate this variation">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onRegenerate}
							disabled={!canRegenerate}
							aria-label="Regenerate this variation"
						>
							{isRegenerating ? (
								<Loader2Icon aria-hidden className="w-4 h-4 animate-spin" />
							) : (
								<RefreshCwIcon aria-hidden className="w-4 h-4" />
							)}
						</Button>
					</Tooltip>
				</div>
			</CardContent>
		</Card>
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
				<CopyButton label="Copy" value={value} icon={CopyIcon} />
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

function CopyButton({
	label,
	value,
	className,
	icon: Icon = ClipboardCopyIcon,
}: {
	label: string;
	value: string;
	className?: string;
	icon?: typeof ClipboardCopyIcon;
}) {
	const [copied, setCopied] = useState(false);
	const CopiedIcon = Icon === CopyIcon ? CheckIcon : ClipboardCheckIcon;
	return (
		<Button
			type="button"
			variant={className ? "outline" : "ghost"}
			size="sm"
			className={className}
			onClick={() => {
				navigator.clipboard.writeText(value);
				setCopied(true);
				setTimeout(() => setCopied(false), 1200);
			}}
		>
			{copied ? (
				<>
					<CopiedIcon aria-hidden className="w-3.5 h-3.5" />
					Copied
				</>
			) : (
				<>
					<Icon aria-hidden className="w-3.5 h-3.5" />
					{label}
				</>
			)}
		</Button>
	);
}
