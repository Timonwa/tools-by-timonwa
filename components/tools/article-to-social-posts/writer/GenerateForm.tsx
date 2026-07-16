"use client";

import { Loader2Icon, SparklesIcon, Wand2Icon } from "lucide-react";
import { useId } from "react";
import DraftReuseControls from "@/components/_shared/DraftReuseControls";
import ErrorNotice from "@/components/_shared/ErrorNotice";
import InputKindTabs, {
	type InputKindType,
} from "@/components/_shared/InputKindTabs";
import { MAX_DRAFT_CHARS } from "@/components/tools/article-to-social-posts/constants/draft-input";
import { THREADABLE_PLATFORMS } from "@/components/tools/article-to-social-posts/constants/platforms";
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
import ThreadFormat from "./ThreadFormat";

type GenerateFormProps = {
	inputKind: InputKindType;
	onInputKindChange: (kind: InputKindType) => void;
	url: string;
	onUrlChange: (url: string) => void;
	text: string;
	onTextChange: (text: string) => void;
	textReuse: boolean;
	onToggleTextReuse: (next: boolean) => void;
	urlReuse: boolean;
	onToggleUrlReuse: (next: boolean) => void;
	onClearDraft: () => void;
	tone: ToneType;
	onToneChange: (tone: ToneType) => void;
	platforms: PlatformType[];
	onTogglePlatform: (p: PlatformType) => void;
	xThreadLength: number;
	onXThreadLengthChange: (n: number) => void;
	isGenerating: boolean;
	hasResult: boolean;
	error: string | null;
	onSubmit: (e: React.FormEvent) => void;
	templates: PresetTemplateType[];
	activeTemplateId: string | null;
	onApplyTemplate: (t: PresetTemplateType) => void;
	onSaveTemplate: (name: string) => void;
	onDeleteTemplate: (id: string) => void;
	onUpdateTemplate: (id: string) => void;
	onRenameTemplate: (id: string, name: string) => void;
};

export default function GenerateForm({
	inputKind,
	onInputKindChange,
	url,
	onUrlChange,
	text,
	onTextChange,
	textReuse,
	onToggleTextReuse,
	urlReuse,
	onToggleUrlReuse,
	onClearDraft,
	tone,
	onToneChange,
	platforms,
	onTogglePlatform,
	xThreadLength,
	onXThreadLengthChange,
	isGenerating,
	hasResult,
	error,
	onSubmit,
	templates,
	activeTemplateId,
	onApplyTemplate,
	onSaveTemplate,
	onDeleteTemplate,
	onUpdateTemplate,
	onRenameTemplate,
}: GenerateFormProps) {
	const urlInputId = useId();
	const textInputId = useId();
	const counterId = useId();
	const reuseId = useId();

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
					Paste an article&apos;s URL or its text (up to{" "}
					{MAX_DRAFT_CHARS.toLocaleString()} characters). Posts are generated
					for every selected platform — copy them and post to each site
					manually.
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
						onUpdate={onUpdateTemplate}
						onRename={onRenameTemplate}
						disabled={isGenerating}
					/>

					<InputKindTabs
						value={inputKind}
						onChange={onInputKindChange}
						disabled={isGenerating}
						textLabel="Paste text"
					/>

					{inputKind === "url" ? (
						<div>
							<label
								htmlFor={urlInputId}
								className="text-sm font-medium mb-2 block"
							>
								Article URL
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
							<DraftReuseControls
								id={reuseId}
								reuse={urlReuse}
								onToggleReuse={onToggleUrlReuse}
								onClear={() => onUrlChange("")}
								canClear={url.trim().length > 0}
								disabled={isGenerating}
								className="mt-2"
								noun="link"
								scope="the AI tools"
							/>
						</div>
					) : (
						<div>
							<div className="flex items-baseline justify-between mb-2 gap-2">
								<label htmlFor={textInputId} className="text-sm font-medium">
									Your text
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
								placeholder="Paste the article text here — title, body, everything the posts should draw from."
								disabled={isGenerating}
								aria-describedby={counterId}
								aria-invalid={textOver || undefined}
								className="h-48 max-h-96 resize-y [field-sizing:normal]"
							/>
							<p className="mt-1.5 text-[11px] text-muted-foreground">
								Your text stays in your browser and this request only — never
								cached on our servers.
							</p>
							<DraftReuseControls
								id={reuseId}
								reuse={textReuse}
								onToggleReuse={onToggleTextReuse}
								onClear={onClearDraft}
								canClear={text.length > 0}
								disabled={isGenerating}
								className="mt-2"
								noun="text"
							/>
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

					{platforms.some((p) => THREADABLE_PLATFORMS.includes(p)) && (
						<ThreadFormat
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
									? `Reading article & ${hasResult ? "regenerating" : "generating"} posts...`
									: `${hasResult ? "Regenerating" : "Generating"} posts...`}
							</>
						) : (
							<>
								<SparklesIcon className="w-4 h-4" />
								{hasResult ? "Regenerate posts" : "Generate posts"}
							</>
						)}
					</Button>

					{error && <ErrorNotice message={error} />}
				</form>
			</CardContent>
		</Card>
	);
}
