"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

import DraftReuseControls from "@/components/_shared/DraftReuseControls";
import ErrorNotice from "@/components/_shared/ErrorNotice";
import InputKindTabs from "@/components/_shared/InputKindTabs";
import { useToolDraft } from "@/components/_shared/shared-draft";
import {
	type DraftInputType,
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import { Button, Input, Textarea } from "@/components/ui";

import { generateSeoMeta } from "@/lib/tools/article-to-seo-meta/actions";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";

export type SeoFormParamsType = {
	source: DraftInputType;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
};

type SeoFormState = { error?: string } | null;

type SeoFormProps = {
	onResult: (
		result: SeoMetaResultType,
		usage: TokenUsageType,
		params: SeoFormParamsType,
	) => void;
	onLoadingChange?: (loading: boolean) => void;
	/** Seed values for a restore-from-history. The parent remounts this form
	 * (via `key`) when restoring, so these are read once on mount. */
	initial?: SeoFormParamsType;
	hasResult?: boolean;
};

function SubmitButton({
	disabled,
	hasResult,
}: {
	disabled?: boolean;
	hasResult?: boolean;
}) {
	const { pending } = useFormStatus();
	const label = pending
		? hasResult
			? "Regenerating…"
			: "Generating…"
		: hasResult
			? "Regenerate variations"
			: "Generate variations";
	return (
		<Button type="submit" size="lg" disabled={pending || disabled}>
			{label}
		</Button>
	);
}

export default function SeoForm({
	onResult,
	onLoadingChange,
	initial,
	hasResult,
}: SeoFormProps) {
	const initialSource = initial?.source;
	const {
		text: article,
		setText: setArticle,
		url,
		setUrl,
		inputKind,
		setInputKind,
		textReuse,
		toggleTextReuse,
		urlReuse,
		toggleUrlReuse,
		clear: clearArticle,
	} = useToolDraft({
		kind: initialSource?.kind ?? "text",
		url: initialSource?.kind === "url" ? initialSource.url : "",
		text: initialSource?.kind === "text" ? initialSource.text : "",
	});
	const [keyword, setKeyword] = useState(initial?.primaryKeyword ?? "");
	const [count, setCount] = useState<1 | 2 | 3>(initial?.variationCount ?? 3);
	const urlId = useId();
	const articleId = useId();
	const keywordId = useId();
	const reuseId = useId();

	const articleLen = article.length;
	const overLimit = articleLen > MAX_ARTICLE_CHARS;
	const hasInput =
		inputKind === "url" ? url.trim().length > 0 : article.trim().length > 0;

	// The form action validates client-side, calls the server action, and hands
	// results straight to the parent — returning only an error string for display
	// (React 19 useActionState). No effects needed.
	const [state, formAction, isPending] = useActionState<SeoFormState>(
		async (): Promise<SeoFormState> => {
			const source: DraftInputType =
				inputKind === "url"
					? { kind: "url", url: url.trim() }
					: { kind: "text", text: article };

			if (source.kind === "url") {
				if (!source.url) return { error: "Paste a link before generating." };
			} else {
				if (!source.text.trim())
					return { error: "Paste your article before generating." };
				if (overLimit)
					return {
						error: `Your article is too long. Keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} characters, then try again.`,
					};
			}

			onLoadingChange?.(true);
			try {
				const byokKey = byokStorage.get() ?? undefined;
				const trimmedKeyword = keyword.trim() || undefined;
				const res = await generateSeoMeta({
					source,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
					googleApiKey: byokKey,
					googleModel: byokKey ? byokModelStorage.get() : undefined,
				});
				if (!res.ok) return { error: res.error };
				onResult(res.result, res.usage, {
					source,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
				});
				return null;
			} catch {
				return {
					error:
						"We couldn't reach the server. Check your internet connection and try again.",
				};
			} finally {
				onLoadingChange?.(false);
			}
		},
		null,
	);

	return (
		<form action={formAction} className="space-y-5">
			<div>
				<InputKindTabs
					value={inputKind}
					onChange={setInputKind}
					disabled={isPending}
					textLabel="Paste article"
				/>

				{inputKind === "url" ? (
					<div className="mt-3">
						<label htmlFor={urlId} className="block text-sm font-medium mb-2">
							Article URL
						</label>
						<Input
							id={urlId}
							type="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://your-blog.com/post-slug"
							disabled={isPending}
						/>
						<p className="mt-1 text-xs text-muted-foreground">
							Point at a published post to write meta tags for a live article.
						</p>
						<DraftReuseControls
							id={reuseId}
							reuse={urlReuse}
							onToggleReuse={toggleUrlReuse}
							onClear={() => setUrl("")}
							canClear={url.trim().length > 0}
							disabled={isPending}
							className="mt-2"
							noun="link"
							scope="the AI tools"
						/>
					</div>
				) : (
					<div className="mt-3">
						<label
							htmlFor={articleId}
							className="block text-sm font-medium mb-2"
						>
							Your draft
						</label>
						<Textarea
							id={articleId}
							value={article}
							onChange={(e) => setArticle(e.target.value)}
							placeholder="Paste the full article, or a solid draft…"
							disabled={isPending}
							className="h-48 max-h-96 resize-y [field-sizing:normal]"
						/>
						<p
							className={`mt-1 text-xs tabular-nums ${
								overLimit ? "text-destructive" : "text-muted-foreground"
							}`}
						>
							{articleLen.toLocaleString()} /{" "}
							{MAX_ARTICLE_CHARS.toLocaleString()} chars
						</p>
						<DraftReuseControls
							id={reuseId}
							reuse={textReuse}
							onToggleReuse={toggleTextReuse}
							onClear={clearArticle}
							canClear={article.length > 0}
							disabled={isPending}
							className="mt-2"
						/>
					</div>
				)}
			</div>

			<div>
				<label htmlFor={keywordId} className="block text-sm font-medium mb-2">
					Primary keyword{" "}
					<span className="text-muted-foreground font-normal">(optional)</span>
				</label>
				<Input
					id={keywordId}
					value={keyword}
					onChange={(e) => setKeyword(e.target.value)}
					placeholder="e.g. agent memory patterns"
					disabled={isPending}
				/>
				<p className="mt-1 text-xs text-muted-foreground">
					If set, it appears in every title and description.
				</p>
			</div>

			<fieldset>
				<legend className="block text-sm font-medium mb-2">Variations</legend>
				<div className="inline-flex rounded-md border border-border overflow-hidden">
					{[1, 2, 3].map((n) => {
						const active = count === n;
						return (
							<button
								key={n}
								type="button"
								onClick={() => setCount(n as 1 | 2 | 3)}
								disabled={isPending}
								aria-pressed={active}
								className={`px-4 py-1.5 text-sm font-medium transition-colors ${
									active
										? "bg-primary text-primary-foreground"
										: "bg-background hover:bg-accent"
								}`}
							>
								{n}
							</button>
						);
					})}
				</div>
			</fieldset>

			{state?.error && <ErrorNotice message={state.error} />}

			<SubmitButton
				disabled={!hasInput || (inputKind === "text" && overLimit)}
				hasResult={hasResult}
			/>
		</form>
	);
}
