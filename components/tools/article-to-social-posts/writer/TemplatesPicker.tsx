"use client";

import { BookmarkIcon, CheckIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { PLATFORM_LABELS } from "@/components/tools/article-to-social-posts/constants/platforms";
import {
	EMOJI_LEVEL_LABELS,
	HASHTAG_LEVEL_LABELS,
	MAX_TEMPLATES,
	VOICE_LABELS,
} from "@/components/tools/article-to-social-posts/constants/preferences";
import { TONES } from "@/components/tools/article-to-social-posts/constants/tones";
import type { PresetTemplateType } from "@/components/tools/article-to-social-posts/types";
import { Button, Input } from "@/components/ui";

import { cn } from "@/lib/utils/cn";

const toneLabel = (tone: PresetTemplateType["tone"]): string =>
	TONES.find((t) => t.value === tone)?.label ?? tone;

type TemplatesPickerProps = {
	templates: PresetTemplateType[];
	activeTemplateId: string | null;
	onApply: (t: PresetTemplateType) => void;
	onSave: (name: string) => void;
	onDelete: (id: string) => void;
	disabled?: boolean;
};

export default function TemplatesPicker({
	templates,
	activeTemplateId,
	onApply,
	onSave,
	onDelete,
	disabled,
}: TemplatesPickerProps) {
	const [nameDraft, setNameDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);

	const full = templates.length >= MAX_TEMPLATES;

	const commitSave = () => {
		const name = nameDraft.trim();
		if (!name) return;
		onSave(name);
		setNameDraft("");
		setIsSaving(false);
	};

	const cancelSave = () => {
		setNameDraft("");
		setIsSaving(false);
	};

	return (
		<div className="rounded-md border border-border bg-muted/30 p-2.5 space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-1.5 text-xs font-medium">
					<BookmarkIcon aria-hidden className="w-3.5 h-3.5 text-primary" />
					Templates
				</div>
				{!isSaving && (
					<button
						type="button"
						onClick={() => setIsSaving(true)}
						disabled={disabled || full}
						title={
							full
								? `Max ${MAX_TEMPLATES} templates — delete one first`
								: "Save the current tone, platforms, and writing prefs as a reusable template"
						}
						className="text-[11px] text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
					>
						+ Save current
					</button>
				)}
			</div>

			{isSaving && (
				<div className="flex gap-1.5">
					<Input
						autoFocus
						value={nameDraft}
						onChange={(e) => setNameDraft(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								commitSave();
							}
							if (e.key === "Escape") {
								e.preventDefault();
								cancelSave();
							}
						}}
						placeholder="Name it (e.g. my Twitter voice)"
						maxLength={40}
						className="h-8 text-xs"
					/>
					<Button
						size="sm"
						type="button"
						onClick={commitSave}
						disabled={!nameDraft.trim()}
						aria-label="Save template"
					>
						<CheckIcon aria-hidden className="w-3.5 h-3.5" />
					</Button>
					<Button
						size="sm"
						type="button"
						variant="ghost"
						onClick={cancelSave}
						aria-label="Cancel"
					>
						<XIcon aria-hidden className="w-3.5 h-3.5" />
					</Button>
				</div>
			)}

			{templates.length === 0 ? (
				<p className="text-[11px] text-muted-foreground italic">
					Save tone + voice + platform combos you use often. One click to
					reapply.
				</p>
			) : (
				<div className="flex flex-wrap gap-1.5">
					{templates.map((t) => (
						<TemplateChip
							key={t.id}
							template={t}
							active={activeTemplateId === t.id}
							disabled={disabled}
							onApply={() => onApply(t)}
							onDelete={() => onDelete(t.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function TemplateChip({
	template,
	active,
	disabled,
	onApply,
	onDelete,
}: {
	template: PresetTemplateType;
	active: boolean;
	disabled?: boolean;
	onApply: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="group relative inline-flex">
			<div
				className={cn(
					"inline-flex items-stretch rounded-full border text-xs overflow-hidden transition-colors",
					active
						? "border-primary/50 bg-primary/10"
						: "border-border bg-background",
				)}
			>
				<button
					type="button"
					onClick={onApply}
					disabled={disabled}
					aria-pressed={active}
					className={cn(
						"pl-2.5 pr-2 py-1 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
						active ? "text-primary hover:bg-primary/15" : "hover:bg-accent",
					)}
				>
					{active && (
						<CheckIcon
							aria-hidden
							className="inline-block w-3 h-3 mr-1 -mt-px align-middle"
						/>
					)}
					{template.name}
				</button>
				<button
					type="button"
					onClick={onDelete}
					aria-label={`Delete template ${template.name}`}
					disabled={disabled}
					className={cn(
						"px-1.5 py-1 border-l text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:cursor-not-allowed",
						active ? "border-primary/30" : "border-border",
					)}
				>
					<XIcon aria-hidden className="w-3 h-3" />
				</button>
			</div>
			<TemplatePreview template={template} />
		</div>
	);
}

function TemplatePreview({ template }: { template: PresetTemplateType }) {
	const { tone, platforms, xThreadLength, preferences: p } = template;
	return (
		<div
			role="tooltip"
			className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-64 max-w-[calc(100vw-2rem)] rounded-md border border-border/60 bg-popover/90 backdrop-blur-md px-3 py-2 text-[11px] leading-snug text-popover-foreground shadow-md opacity-0 translate-y-1 transition-all duration-150 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0"
		>
			<div className="space-y-1">
				<Row label="Tone" value={toneLabel(tone)} />
				<Row
					label="Platforms"
					value={
						platforms.length
							? platforms.map((p) => PLATFORM_LABELS[p] ?? p).join(", ")
							: "None"
					}
				/>
				{platforms.includes("x") && xThreadLength > 1 && (
					<Row label="X thread" value={`${xThreadLength} posts`} />
				)}
				<Row label="Voice" value={VOICE_LABELS[p.voice] ?? p.voice} />
				<Row label="Emoji" value={EMOJI_LEVEL_LABELS[p.emojiLevel]} />
				<Row label="Hashtags" value={HASHTAG_LEVEL_LABELS[p.hashtagLevel]} />
				{p.alwaysIncludeHashtags.length > 0 && (
					<Row
						label="Always"
						value={p.alwaysIncludeHashtags.map((t) => `#${t}`).join(" ")}
					/>
				)}
				{p.neverUseHashtags.length > 0 && (
					<Row
						label="Never"
						value={p.neverUseHashtags.map((t) => `#${t}`).join(" ")}
					/>
				)}
			</div>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex gap-2">
			<span className="text-muted-foreground min-w-[64px]">{label}</span>
			<span className="font-medium text-foreground break-words">{value}</span>
		</div>
	);
}
