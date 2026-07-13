"use client";

import { useActionState, useId, useState } from "react";
import { useFormStatus } from "react-dom";

import {
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { generateSeoMeta } from "@/lib/tools/article-to-seo-meta/actions";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";

export type SeoFormParamsType = {
	article: string;
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
};

function SubmitButton({ disabled }: { disabled?: boolean }) {
	const { pending } = useFormStatus();
	return (
		<Button type="submit" size="lg" disabled={pending || disabled}>
			{pending ? "Generating…" : "Generate variations"}
		</Button>
	);
}

export default function SeoForm({
	onResult,
	onLoadingChange,
	initial,
}: SeoFormProps) {
	const [article, setArticle] = useState(initial?.article ?? "");
	const [keyword, setKeyword] = useState(initial?.primaryKeyword ?? "");
	const [count, setCount] = useState<1 | 2 | 3>(initial?.variationCount ?? 3);
	const articleId = useId();
	const keywordId = useId();

	const articleLen = article.length;
	const overLimit = articleLen > MAX_ARTICLE_CHARS;

	// The form action validates client-side, calls the server action, and hands
	// results straight to the parent — returning only an error string for display
	// (React 19 useActionState). No effects needed.
	const [state, formAction, isPending] = useActionState<SeoFormState>(
		async (): Promise<SeoFormState> => {
			if (!article.trim()) return { error: "Paste the article draft first." };
			if (overLimit)
				return {
					error: `Article is too long — keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} chars.`,
				};
			onLoadingChange?.(true);
			try {
				const byokKey = byokStorage.get() ?? undefined;
				const trimmedKeyword = keyword.trim() || undefined;
				const { result, usage } = await generateSeoMeta({
					article,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
					googleApiKey: byokKey,
					googleModel: byokKey ? byokModelStorage.get() : undefined,
				});
				onResult(result, usage, {
					article,
					primaryKeyword: trimmedKeyword,
					variationCount: count,
				});
				return null;
			} catch (err) {
				return {
					error: err instanceof Error ? err.message : "Something went wrong.",
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
				<label htmlFor={articleId} className="block text-sm font-medium mb-1.5">
					Article draft
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
					{articleLen.toLocaleString()} / {MAX_ARTICLE_CHARS.toLocaleString()}{" "}
					chars
				</p>
			</div>

			<div>
				<label htmlFor={keywordId} className="block text-sm font-medium mb-1.5">
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
				<legend className="block text-sm font-medium mb-1.5">Variations</legend>
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

			{state?.error && (
				<p className="text-sm text-destructive" role="alert">
					{state.error}
				</p>
			)}

			<SubmitButton disabled={!article.trim() || overLimit} />
		</form>
	);
}
