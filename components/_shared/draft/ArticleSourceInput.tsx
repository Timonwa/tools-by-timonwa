"use client";

import { useId } from "react";

import DraftReuseControls from "./DraftReuseControls";
import InputKindTabs from "./InputKindTabs";
import { Input, Textarea } from "@/components/ui";
import type { InputKindType } from "@/lib/tools/_shared/draft-input";
import { cn } from "@/lib/utils/cn";

const DEFAULT_MAX_CHARS = 15000;

type Props = {
	inputKind: InputKindType;
	onInputKindChange: (kind: InputKindType) => void;
	url: string;
	onUrlChange: (value: string) => void;
	urlReuse: boolean;
	onToggleUrlReuse: (next: boolean) => void;
	text: string;
	onTextChange: (value: string) => void;
	textReuse: boolean;
	onToggleTextReuse: (next: boolean) => void;
	onClearText: () => void;
	disabled?: boolean;
	/** Max characters for the text counter. Defaults to 15,000. */
	maxChars?: number;
	urlPlaceholder?: string;
	textPlaceholder?: string;
};

/**
 * The full source-input section shared by the draft-based AI tools (Article to
 * Social Posts, Article to SEO Meta): a URL / paste-text tab switcher, the
 * matching field with its character counter and privacy note, and the
 * "reuse across tools" controls. Pairs with `useToolDraft` — the tool owns the
 * state and passes it in, so both tools stay pixel-identical.
 */
export default function ArticleSourceInput({
	inputKind,
	onInputKindChange,
	url,
	onUrlChange,
	urlReuse,
	onToggleUrlReuse,
	text,
	onTextChange,
	textReuse,
	onToggleTextReuse,
	onClearText,
	disabled,
	maxChars = DEFAULT_MAX_CHARS,
	urlPlaceholder = "https://your-blog.com/post-slug",
	textPlaceholder = "Paste the full article, or a near-final draft…",
}: Props) {
	const urlId = useId();
	const textId = useId();
	const counterId = useId();
	const urlReuseId = useId();
	const textReuseId = useId();

	const over = text.length > maxChars;

	return (
		<div>
			<InputKindTabs
				value={inputKind}
				onChange={onInputKindChange}
				disabled={disabled}
				textLabel="Paste text"
			/>

			{inputKind === "url" ? (
				<div className="mt-3">
					<label htmlFor={urlId} className="block text-sm font-medium mb-2">
						Article URL
					</label>
					<Input
						id={urlId}
						type="url"
						required
						value={url}
						onChange={(e) => onUrlChange(e.target.value)}
						placeholder={urlPlaceholder}
						disabled={disabled}
					/>
					<DraftReuseControls
						id={urlReuseId}
						reuse={urlReuse}
						onToggleReuse={onToggleUrlReuse}
						onClear={() => onUrlChange("")}
						canClear={url.trim().length > 0}
						disabled={disabled}
						className="mt-2"
						noun="link"
						scope="the AI tools"
					/>
				</div>
			) : (
				<div className="mt-3">
					<div className="flex items-baseline justify-between mb-2 gap-2">
						<label htmlFor={textId} className="text-sm font-medium">
							Your text
						</label>
						<span
							id={counterId}
							aria-live="polite"
							className={cn(
								"text-xs tabular-nums",
								over ? "text-destructive font-medium" : "text-muted-foreground",
							)}
						>
							{text.length.toLocaleString()} / {maxChars.toLocaleString()}
						</span>
					</div>
					<Textarea
						id={textId}
						required
						value={text}
						onChange={(e) => onTextChange(e.target.value)}
						placeholder={textPlaceholder}
						disabled={disabled}
						aria-describedby={counterId}
						aria-invalid={over || undefined}
						className="h-48 max-h-96 resize-y [field-sizing:normal]"
					/>
					<p className="mt-1.5 text-[11px] text-muted-foreground">
						Your text stays in your browser and this request only — never cached
						on our servers.
					</p>
					<DraftReuseControls
						id={textReuseId}
						reuse={textReuse}
						onToggleReuse={onToggleTextReuse}
						onClear={onClearText}
						canClear={text.length > 0}
						disabled={disabled}
						className="mt-2"
						noun="text"
					/>
				</div>
			)}
		</div>
	);
}
