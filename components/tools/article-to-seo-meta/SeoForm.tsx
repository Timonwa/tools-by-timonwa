"use client";

import { useEffect, useId, useState } from "react";

import { generateSeoMeta } from "@/lib/tools/article-to-seo-meta/actions";
import {
	MAX_ARTICLE_CHARS,
	type SeoMetaResultType,
	type TokenUsageType,
} from "@/components/tools/article-to-seo-meta/types";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { byokModelStorage, byokStorage } from "@/lib/utils/byok-storage";

export type SeoFormParamsType = {
	article: string;
	primaryKeyword?: string;
	variationCount: 1 | 2 | 3;
};

type SeoFormProps = {
	onResult: (
		result: SeoMetaResultType,
		usage: TokenUsageType,
		params: SeoFormParamsType,
	) => void;
	onLoadingChange?: (loading: boolean) => void;
	/** When this changes, the form resets to the provided values. Used to
	 * restore a previous generation from history. */
	initial?: SeoFormParamsType;
};

export default function SeoForm({ onResult, onLoadingChange, initial }: SeoFormProps) {
	const [article, setArticle] = useState(initial?.article ?? "");
	const [keyword, setKeyword] = useState(initial?.primaryKeyword ?? "");
	const [count, setCount] = useState<1 | 2 | 3>(initial?.variationCount ?? 3);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | undefined>();
	const articleId = useId();
	const keywordId = useId();

	// Resync form fields when the parent asks for a restore (new `initial`).
	useEffect(() => {
		if (!initial) return;
		setArticle(initial.article);
		setKeyword(initial.primaryKeyword ?? "");
		setCount(initial.variationCount);
		setError(undefined);
	}, [initial]);

	const articleLen = article.length;
	const overLimit = articleLen > MAX_ARTICLE_CHARS;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(undefined);
		if (!article.trim()) {
			setError("Paste the article draft first.");
			return;
		}
		if (overLimit) {
			setError(
				`Article is too long — keep it under ${MAX_ARTICLE_CHARS.toLocaleString()} chars.`,
			);
			return;
		}
		setLoading(true);
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
		} catch (err) {
			setError(err instanceof Error ? err.message : "Something went wrong.");
		} finally {
			setLoading(false);
			onLoadingChange?.(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-5">
			<div>
				<label htmlFor={articleId} className="block text-sm font-medium mb-1.5">
					Article draft
				</label>
				<Textarea
					id={articleId}
					value={article}
					onChange={(e) => setArticle(e.target.value)}
					placeholder="Paste the full article, or a solid draft…"
					disabled={loading}
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
					disabled={loading}
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
								disabled={loading}
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

			{error && (
				<p className="text-sm text-destructive" role="alert">
					{error}
				</p>
			)}

			<Button
				type="submit"
				size="lg"
				disabled={loading || !article.trim() || overLimit}
			>
				{loading ? "Generating…" : "Generate variations"}
			</Button>
		</form>
	);
}
