"use client";

import {
	AlertCircleIcon,
	FileTextIcon,
	LinkIcon,
	Loader2Icon,
	SparklesIcon,
	Wand2Icon,
} from "lucide-react";
import { useId } from "react";
import { MAX_DRAFT_CHARS } from "@/components/tools/article-to-social-posts/constants/draft-input";
import type { InputKindType } from "@/components/tools/article-to-social-posts/hooks/use-writer";
import type {
	PlatformType,
	PresetTemplateType,
	ToneType,
} from "@/components/tools/article-to-social-posts/types";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Textarea,
} from "@/components/ui";

import { cn } from "@/lib/utils/cn";
import PlatformPicker from "./PlatformPicker";
import TemplatesPicker from "./TemplatesPicker";
import TonePicker from "./TonePicker";
import XFormat from "./XFormat";

type GenerateFormProps = {
	inputKind: InputKindType;
	onInputKindChange: (kind: InputKindType) => void;
	url: string;
	onUrlChange: (url: string) => void;
	text: string;
	onTextChange: (text: string) => void;
	tone: ToneType;
	onToneChange: (tone: ToneType) => void;
	platforms: PlatformType[];
	onTogglePlatform: (p: PlatformType) => void;
	xThreadLength: number;
	onXThreadLengthChange: (n: number) => void;
	isGenerating: boolean;
	error: string | null;
	onSubmit: (e: React.FormEvent) => void;
	templates: PresetTemplateType[];
	activeTemplateId: string | null;
	onApplyTemplate: (t: PresetTemplateType) => void;
	onSaveTemplate: (name: string) => void;
	onDeleteTemplate: (id: string) => void;
};

export default function GenerateForm({
	inputKind,
	onInputKindChange,
	url,
	onUrlChange,
	text,
	onTextChange,
	tone,
	onToneChange,
	platforms,
	onTogglePlatform,
	xThreadLength,
	onXThreadLengthChange,
	isGenerating,
	error,
	onSubmit,
	templates,
	activeTemplateId,
	onApplyTemplate,
	onSaveTemplate,
	onDeleteTemplate,
}: GenerateFormProps) {
	const urlInputId = useId();
	const textInputId = useId();
	const counterId = useId();

	const hasInput =
		inputKind === "url" ? url.trim().length > 0 : text.trim().length > 0;
	const textOver = text.length > MAX_DRAFT_CHARS;
	const disabled =
		isGenerating || !hasInput || platforms.length === 0 || textOver;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2 text-lg">
					<Wand2Icon className="w-5 h-5 text-primary" />
					Generate social media posts
				</CardTitle>
				<CardDescription>
					Paste a published URL or your unpublished draft (up to ~2,500 words).
					Drafts are generated for every selected platform — copy them and post
					to each site manually.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form onSubmit={onSubmit} className="space-y-4">
					<TemplatesPicker
						templates={templates}
						activeTemplateId={activeTemplateId}
						onApply={onApplyTemplate}
						onSave={onSaveTemplate}
						onDelete={onDeleteTemplate}
						disabled={isGenerating}
					/>

					<InputKindTabs
						value={inputKind}
						onChange={onInputKindChange}
						disabled={isGenerating}
					/>

					{inputKind === "url" ? (
						<div>
							<label
								htmlFor={urlInputId}
								className="text-sm font-medium mb-2 block"
							>
								Blog post URL
							</label>
							<Input
								id={urlInputId}
								type="url"
								required
								value={url}
								onChange={(e) => onUrlChange(e.target.value)}
								placeholder="https://your-blog.com/post-slug"
								disabled={isGenerating}
							/>
						</div>
					) : (
						<div>
							<div className="flex items-baseline justify-between mb-2 gap-2">
								<label htmlFor={textInputId} className="text-sm font-medium">
									Draft text
								</label>
								<span
									id={counterId}
									aria-live="polite"
									className={cn(
										"text-xs tabular-nums",
										textOver
											? "text-destructive font-medium"
											: "text-muted-foreground",
									)}
								>
									{text.length.toLocaleString()} /{" "}
									{MAX_DRAFT_CHARS.toLocaleString()}
								</span>
							</div>
							<Textarea
								id={textInputId}
								required
								value={text}
								onChange={(e) => onTextChange(e.target.value)}
								placeholder="Paste your unpublished draft here — title, body, everything you'd want the social posts to reflect."
								disabled={isGenerating}
								aria-describedby={counterId}
								aria-invalid={textOver || undefined}
								className="h-48 max-h-96 resize-y [field-sizing:normal]"
							/>
							<p className="mt-1.5 text-[11px] text-muted-foreground">
								Draft text stays in your browser and this request only — never
								cached on our servers.
							</p>
						</div>
					)}

					<TonePicker
						value={tone}
						onChange={onToneChange}
						disabled={isGenerating}
					/>

					<PlatformPicker
						value={platforms}
						onToggle={onTogglePlatform}
						disabled={isGenerating}
					/>

					{platforms.includes("x") && (
						<XFormat
							length={xThreadLength}
							onChange={onXThreadLengthChange}
							disabled={isGenerating}
						/>
					)}

					<Button
						type="submit"
						size="lg"
						className="w-full"
						disabled={disabled}
					>
						{isGenerating ? (
							<>
								<Loader2Icon className="w-4 h-4 animate-spin" />
								{inputKind === "url"
									? "Reading article & generating drafts..."
									: "Generating drafts..."}
							</>
						) : (
							<>
								<SparklesIcon className="w-4 h-4" />
								Generate drafts
							</>
						)}
					</Button>

					{error && (
						<div
							role="alert"
							className="flex items-start gap-2 text-sm text-destructive p-3 rounded-md border border-destructive/30 bg-destructive/5"
						>
							<AlertCircleIcon
								aria-hidden
								className="w-4 h-4 mt-0.5 shrink-0"
							/>
							<span>{error}</span>
						</div>
					)}
				</form>
			</CardContent>
		</Card>
	);
}

function InputKindTabs({
	value,
	onChange,
	disabled,
}: {
	value: InputKindType;
	onChange: (kind: InputKindType) => void;
	disabled: boolean;
}) {
	const tabs: { id: InputKindType; label: string; icon: typeof LinkIcon }[] = [
		{ id: "url", label: "URL", icon: LinkIcon },
		{ id: "text", label: "Paste draft", icon: FileTextIcon },
	];
	return (
		<div
			role="tablist"
			aria-label="Source input type"
			className="inline-flex rounded-md border border-border bg-muted/40 p-1 text-sm"
		>
			{tabs.map((t) => {
				const active = value === t.id;
				const Icon = t.icon;
				return (
					<button
						key={t.id}
						type="button"
						role="tab"
						aria-selected={active}
						onClick={() => onChange(t.id)}
						disabled={disabled}
						className={cn(
							"inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors",
							active
								? "bg-background text-foreground shadow-sm"
								: "text-muted-foreground hover:text-foreground",
							disabled && "opacity-50 cursor-not-allowed",
						)}
					>
						<Icon aria-hidden className="w-3.5 h-3.5" />
						{t.label}
					</button>
				);
			})}
		</div>
	);
}
