"use client";

import {
	BookmarkIcon,
	CheckIcon,
	PencilIcon,
	RefreshCwIcon,
	XIcon,
} from "lucide-react";
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
	onUpdate: (id: string) => void;
	onRename: (id: string, name: string) => void;
	disabled?: boolean;
};

export default function TemplatesPicker({
	templates,
	activeTemplateId,
	onApply,
	onSave,
	onDelete,
	onUpdate,
	onRename,
	disabled,
}: TemplatesPickerProps) {
	const [nameDraft, setNameDraft] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

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

			<p className="text-[11px] text-muted-foreground">
				A saved combo of tone, platforms, thread length, and writing prefs.
				Apply one in a click, edit it to your current settings, or rename it.
			</p>

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
					Nothing saved yet. Set a tone, platforms, and prefs, then “Save
					current” to reuse them in one click.
				</p>
			) : (
				<div className="flex flex-wrap gap-1.5">
					{templates.map((t) =>
						editingId === t.id ? (
							<TemplateEditor
								key={t.id}
								template={t}
								disabled={disabled}
								onRename={(name) => onRename(t.id, name)}
								onUpdate={() => onUpdate(t.id)}
								onDone={() => setEditingId(null)}
							/>
						) : (
							<TemplateChip
								key={t.id}
								template={t}
								active={activeTemplateId === t.id}
								disabled={disabled}
								onApply={() => onApply(t)}
								onEdit={() => setEditingId(t.id)}
								onDelete={() => onDelete(t.id)}
							/>
						),
					)}
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
	onEdit,
	onDelete,
}: {
	template: PresetTemplateType;
	active: boolean;
	disabled?: boolean;
	onApply: () => void;
	onEdit: () => void;
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
					onClick={onEdit}
					aria-label={`Edit template ${template.name}`}
					title="Rename or update to current settings"
					disabled={disabled}
					className={cn(
						"px-1.5 py-1 border-l text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:cursor-not-allowed",
						active ? "border-primary/30" : "border-border",
					)}
				>
					<PencilIcon aria-hidden className="w-3 h-3" />
				</button>
				<button
					type="button"
					onClick={onDelete}
					aria-label={`Delete template ${template.name}`}
					title="Delete template"
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

function TemplateEditor({
	template,
	disabled,
	onRename,
	onUpdate,
	onDone,
}: {
	template: PresetTemplateType;
	disabled?: boolean;
	onRename: (name: string) => void;
	onUpdate: () => void;
	onDone: () => void;
}) {
	const [name, setName] = useState(template.name);
	const rename = () => {
		onRename(name);
		onDone();
	};
	const updateConfig = () => {
		onRename(name);
		onUpdate();
		onDone();
	};
	return (
		<div className="w-full rounded-md border border-primary/40 bg-primary/5 p-2 space-y-1.5">
			<div className="flex items-center gap-1.5">
				<Input
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							rename();
						}
						if (e.key === "Escape") {
							e.preventDefault();
							onDone();
						}
					}}
					maxLength={40}
					disabled={disabled}
					aria-label="Template name"
					className="h-7 flex-1 text-xs"
				/>
				<Button
					size="sm"
					type="button"
					variant="ghost"
					disabled={disabled || !name.trim()}
					title="Save the new name only"
					onClick={rename}
				>
					<CheckIcon aria-hidden className="w-3.5 h-3.5" />
					Rename
				</Button>
				<Button
					size="sm"
					type="button"
					disabled={disabled}
					title="Overwrite this template's tone, platforms, and prefs with your current settings"
					onClick={updateConfig}
				>
					<RefreshCwIcon aria-hidden className="w-3.5 h-3.5" />
					Update config
				</Button>
				<Button
					size="sm"
					type="button"
					variant="ghost"
					aria-label="Cancel"
					title="Cancel"
					onClick={onDone}
				>
					<XIcon aria-hidden className="w-3.5 h-3.5" />
				</Button>
			</div>
			<p className="text-[11px] text-muted-foreground">
				<span className="font-medium text-foreground">Rename</span> changes only
				the name.{" "}
				<span className="font-medium text-foreground">Update config</span>{" "}
				replaces the saved tone, platforms, thread length, and writing prefs
				with your current settings.
			</p>
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
